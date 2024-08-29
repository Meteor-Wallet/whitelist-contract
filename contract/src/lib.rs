use near_sdk::store::{IterableMap};
use near_sdk::{env, log, near, AccountId, BorshStorageKey, NearToken, Promise};
use std::collections::HashSet;
use near_sdk::serde_json;

#[near]
#[derive(BorshStorageKey)]
enum EStorageKey {
    ApprovedProjects,
    ApprovedContracts,
    Proposals,
}

#[near(serializers=[borsh, json])]
enum EProposalKind {
    NEW,
    UPDATE,
}

#[near(serializers=[borsh, json])]
enum EValueType {
    STRING,
    ARRAY,
}

#[near(serializers=[borsh, json])]
pub struct OldProjectInfo {
    contract_ids: HashSet<AccountId>,
    metadata: String,
    pending_proposals: HashSet<String>
}

#[near(serializers=[borsh, json])]
pub struct OldProposalInfo {
    project_info: OldProjectInfo,
    kind: EProposalKind,
    // project_id will be null when kind is NEW
    project_id: Option<String>,
    votes: HashSet<AccountId>,
    proposed_by: AccountId,
}

#[near(serializers=[borsh, json])]
pub struct ProjectInfo {
    contract_ids: HashSet<AccountId>,
    metadata: String,
    pending_proposals: HashSet<String>,
    project_id: String,
}

#[near(serializers=[borsh, json])]
pub struct ProjectMetadata {
    twitter_url: Option<String>,
    audit_report_url: Option<String>,
    telegram_username: Option<String>,
    description: Option<String>,
    website_url: Option<String>,
}

#[near(serializers=[borsh, json])]
pub struct ProposalInfo {
    project_info: ProjectInfo,
    kind: EProposalKind,
    // project_id will be null when kind is NEW
    project_id: Option<String>,
    votes: HashSet<AccountId>,
    proposed_by: AccountId,
}

// Define the contract_id structure
#[near(contract_state)]
pub struct Contract {
    guardians: HashSet<AccountId>,
    contract_project_index: IterableMap<AccountId, String>,
    proposals: IterableMap<String, ProposalInfo>,
    approved_projects: IterableMap<String, ProjectInfo>,
    running_id: u32,
}

#[near(serializers=[borsh])]

pub struct OldContract {
    guardians: HashSet<AccountId>,
    contract_project_index: IterableMap<AccountId, String>,
    proposals: IterableMap<String, OldProposalInfo>,
    approved_projects: IterableMap<String, OldProjectInfo>,
    running_id: u32,
}

#[near(serializers=[borsh, json])]
pub struct MetadataStructure {
    key: String,
    value_type: EValueType,
    is_required: bool,
    label: String,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            guardians: HashSet::new(),
            contract_project_index: IterableMap::new(EStorageKey::ApprovedContracts),
            proposals: IterableMap::new(EStorageKey::Proposals),
            approved_projects: IterableMap::new(EStorageKey::ApprovedProjects),
            running_id: 0,
        }
    }
}

#[near]
impl Contract {

    #[private]
    #[init(ignore_state)]
    pub fn migrate() -> Self {
        let mut old_state: OldContract = env::state_read().expect("failed");
        old_state.contract_project_index.clear();
        old_state.approved_projects.clear();
        old_state.proposals.clear();

        Self {
            contract_project_index: IterableMap::new(EStorageKey::ApprovedContracts),
            proposals: IterableMap::new(EStorageKey::Proposals),
            approved_projects: IterableMap::new(EStorageKey::ApprovedProjects),
            running_id: old_state.running_id,
            guardians: old_state.guardians
        }
    }

    #[private]
    pub fn add_guardian(&mut self, account_id: AccountId) {
        self.guardians.insert(account_id);
    }

    #[private]
    pub fn revoke_guardian(&mut self, account_id: AccountId) {
        let removed = self.guardians.remove(&account_id);
        if removed == true {
            for (_, info) in self.proposals.iter_mut() {
                info.votes.remove(&account_id);
            }
        }
    }

    fn generate_id(last_running_id: u32) -> (u32, String) {
        let new_running_id = last_running_id + 1;

        let epoch_time_in_seconds = env::block_timestamp() / 1e9 as u64;

        (
            new_running_id,
            [
                epoch_time_in_seconds.to_string(),
                new_running_id.to_string(),
            ]
            .join(""),
        )
    }

    pub fn list_guardians(self) -> HashSet<AccountId> {
        self.guardians
    }

    #[payable]
    pub fn add_project(
        &mut self,
        contract_ids: HashSet<AccountId>,
        metadata: String,
        project_id: String,
    ) -> Option<String> {
        if env::attached_deposit() != NearToken::from_near(1) {
            panic!("Creating proposal requires depositing 1 NEAR.")
        }

        if project_id.len() == 0 {
            panic!("Project id length must be greater than 0")
        }

        if !project_id.chars().all(char::is_alphanumeric) {
            panic!("Project id must be alphanumeric")
        }

        let existing_project_option =
            self.approved_projects.get_mut(&project_id.clone());

        if existing_project_option.is_some() {
            panic!("Project id is occupied, please use another project id.")
        }

        serde_json::from_str::<ProjectMetadata>(&metadata).expect("Incorrect metadata structure");

        let (new_running_id, proposal_id) = Contract::generate_id(self.running_id);
        self.running_id = new_running_id;

        let proposal = ProposalInfo {
            project_info: ProjectInfo {
                contract_ids: contract_ids.clone(),
                metadata,
                pending_proposals: HashSet::new(),
                project_id
            },
            proposed_by: env::predecessor_account_id(),
            kind: EProposalKind::NEW,
            project_id: None,
            votes: HashSet::new(),
        };

        if self.proposals.contains_key(&proposal_id) {
            panic!("id collision, please try again later");
        } else {
            for contract_id in contract_ids.iter() {
                if self.contract_project_index.contains_key(&contract_id.clone()) {
                    let associated_project_id = self.contract_project_index.get(&contract_id.clone())?;
                    panic!("{} is associated with project {} already.", contract_id.clone(), associated_project_id.clone())
                }
            }
            self.proposals.insert(proposal_id.clone(), proposal);
            Option::from(proposal_id)
        }
    }

    #[payable]
    pub fn update_project(
        &mut self,
        project_id: String,
        contract_ids: HashSet<AccountId>,
        metadata: String
    ) -> String {
        if env::attached_deposit() != NearToken::from_near(1) {
            panic!("Creating proposal requires depositing 1 NEAR.")
        }

        serde_json::from_str::<ProjectMetadata>(&metadata).expect("Incorrect metadata structure");

        if self.approved_projects.contains_key(&project_id) {
            let (new_running_id, proposal_id) = Contract::generate_id(self.running_id);
            self.running_id = new_running_id;

            let proposal = ProposalInfo {
                project_info: ProjectInfo {
                    contract_ids,
                    metadata,
                    pending_proposals: HashSet::new(),
                    project_id: project_id.clone(),
                },
                proposed_by: env::predecessor_account_id(),
                project_id: Option::from(project_id.clone()),
                kind: EProposalKind::UPDATE,
                votes: HashSet::new(),
            };

            if self.proposals.contains_key(&proposal_id) {
                panic!("proposal id collision, please try again later");
            } else {
                self.proposals.insert(proposal_id.clone(), proposal);
                let project_option = self.approved_projects.get_mut(&project_id.clone());
                if project_option.is_some() {
                    let project = project_option.unwrap();
                    project.pending_proposals.insert(proposal_id.clone());
                }
                proposal_id
            }
        } else {
            panic!("Project not found");
        }
    }

    pub fn vote_proposal(&mut self, proposal_id: String) -> bool {
        let is_one_of_guardians = self.guardians.contains(&env::predecessor_account_id());
        if is_one_of_guardians == true {
            let proposal_option = self.proposals.get_mut(&proposal_id);
            match proposal_option {
                Some(proposal) => {
                    proposal.votes.insert(env::predecessor_account_id());

                    if proposal.votes.len() >= 3 {
                        log!("Vote count reached 3, attempting to perform the proposal changes");

                        Promise::new(proposal.proposed_by.clone())
                            .transfer(NearToken::from_near(1));
                        log!("Refunded 1 NEAR to {}", proposal.proposed_by);

                        let mut project_info = ProjectInfo {
                            contract_ids: proposal.project_info.contract_ids.clone(),
                            metadata: proposal.project_info.metadata.clone(),
                            pending_proposals: HashSet::new(),
                            project_id: proposal.project_info.project_id.clone(),
                        };

                        match proposal.kind {
                            EProposalKind::NEW => {
                                let existing_project_option =
                                    self.approved_projects.get_mut(&project_info.project_id.clone());
                                match existing_project_option {
                                    None => {
                                        for contract_id in proposal.project_info.contract_ids.iter() {
                                            let contract_id_option =
                                                self.contract_project_index.get(&contract_id.clone());
                                            match contract_id_option {
                                                None => {
                                                    self.contract_project_index.insert(contract_id.clone(), project_info.project_id.clone());
                                                }
                                                Some(associated_project_id) => {
                                                    log!("Skipping {}, as it is paired with {}", contract_id, associated_project_id);
                                                }
                                            }
                                        }

                                        self.approved_projects.insert(project_info.project_id.clone(), project_info);
                                    }
                                    Some(_) => {
                                        log!("Skipping add project as the project id is occupied.");
                                    }
                                }
                            }
                            EProposalKind::UPDATE => {
                                let project_id_option = proposal.project_id.clone();
                                match project_id_option {
                                    None => {
                                        log!("Project ID is missing in the proposal, and no update will be performed")
                                    }
                                    Some(project_id) => {
                                        let existing_project_option =
                                            self.approved_projects.get_mut(&project_id);
                                        match existing_project_option {
                                            None => {
                                                log!("Project not found for the proposal, and no update will be performed")
                                            }
                                            Some(existing_project) => {
                                                for contract_id in
                                                    existing_project.contract_ids.iter()
                                                {
                                                    self.contract_project_index.remove(contract_id);
                                                }

                                                for contract_id in
                                                    proposal.project_info.contract_ids.iter()
                                                {
                                                    let contract_id_count_option = self
                                                        .contract_project_index
                                                        .get(&contract_id.clone());
                                                    match contract_id_count_option {
                                                        None => {
                                                            self.contract_project_index.insert(contract_id.clone(), project_id.clone());
                                                        }
                                                        Some(associated_project_id) => {
                                                            log!("Skipping {}, as it is paired with {}", contract_id, associated_project_id);
                                                        }
                                                    }
                                                }
                                                

                                                project_info.pending_proposals = existing_project.pending_proposals.clone();
                                                project_info.pending_proposals.remove(&proposal_id);
                                                self.approved_projects
                                                    .insert(project_id, project_info);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        self.proposals.remove(&proposal_id);
                    }
                    true
                }
                None => {
                    panic!("Proposal not found");
                }
            }
        } else {
            panic!("You are not a qualified guardian");
        }
    }

    pub fn withdraw_vote_on_proposal(&mut self, proposal_id: String) -> bool {
        let is_one_of_guardians = self.guardians.contains(&env::predecessor_account_id());
        if is_one_of_guardians == true {
            let proposal_option = self.proposals.get_mut(&proposal_id);
            match proposal_option {
                Some(proposal) => {
                    let is_vote_removed = proposal.votes.remove(&env::predecessor_account_id());
                    if is_vote_removed == true {
                        true
                    } else {
                        panic!("You did not vote the proposal before.");
                    }
                }
                None => {
                    panic!("Unable to find the proposal.");
                }
            }
        } else {
            panic!("You are not a qualified guardian");
        }
    }

    pub fn check_contract_whitelisted(self, contract_id: AccountId) -> bool {
        self.contract_project_index.contains_key(&contract_id)
    }

    pub fn list_projects(&self, from_index: i32, limit: i32) -> Vec<(&String, &ProjectInfo)> {
        self.approved_projects
            .iter()
            .rev()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }

    pub fn list_proposals(&self, from_index: i32, limit: i32) -> Vec<(&String, &ProposalInfo)> {
        self.proposals
            .iter()
            .rev()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }

    pub fn list_contracts(&self, from_index: i32, limit: i32) -> Vec<(&AccountId, &String)> {
        self.contract_project_index
            .iter()
            .rev()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }

    pub fn get_project_id_by_contract_id(&self, contract_id: AccountId) -> Option<&String> {
        self.contract_project_index.get(&contract_id)
    }

    pub fn get_project_by_id(&self, project_id: String) -> Option<&ProjectInfo> {
        self.approved_projects.get(&project_id)
    }

    pub fn get_proposal_by_id(&self, proposal_id: String) -> Option<&ProposalInfo> {
        self.proposals.get(&proposal_id)
    }

    pub fn get_metadata_structure() -> Vec<MetadataStructure>{
        Vec::from([
            MetadataStructure {
                key: "description".to_string(),
                value_type: EValueType::STRING,
                is_required: false,
                label: "Description".to_string()
            },
            MetadataStructure {
                key: "telegram_username".to_string(),
                value_type: EValueType::STRING,
                is_required: false,
                label: "Telegram Username".to_string()
            },
            MetadataStructure {
                key: "twitter_url".to_string(),
                value_type: EValueType::STRING,
                is_required: false,
                label: "Twitter URL".to_string()
            },
            MetadataStructure {
                key: "website_url".to_string(),
                value_type: EValueType::STRING,
                is_required: false,
                label: "Website URL".to_string()
            },
            MetadataStructure {
                key: "audit_report_url".to_string(),
                value_type: EValueType::STRING,
                is_required: false,
                label: "Audit Report URL".to_string()
            },
        ])
    }
}
