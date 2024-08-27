use near_sdk::store::{IterableMap};
use near_sdk::{env, log, near, AccountId, BorshStorageKey, NearToken, Promise};
use std::collections::HashSet;

#[near]
#[derive(BorshStorageKey)]
enum EStorageKey {
    ApprovedProjects,
    ApprovedContractsWithCount,
    Proposals,
}

#[near(serializers=[borsh, json])]
enum EProposalKind {
    NEW,
    UPDATE,
}

#[near(serializers=[borsh, json])]
pub struct ProjectInfo {
    contract_ids: HashSet<AccountId>,
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
    approved_contracts: IterableMap<AccountId, u32>,
    proposals: IterableMap<String, ProposalInfo>,
    approved_projects: IterableMap<String, ProjectInfo>,
    running_id: u32,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            guardians: HashSet::new(),
            approved_contracts: IterableMap::new(EStorageKey::ApprovedContractsWithCount),
            proposals: IterableMap::new(EStorageKey::Proposals),
            approved_projects: IterableMap::new(EStorageKey::ApprovedProjects),
            running_id: 0,
        }
    }
}

#[near]
impl Contract {

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
        twitter_url: Option<String>,
        audit_report_url: Option<String>,
        telegram_username: Option<String>,
        description: Option<String>,
        website_url: Option<String>,
    ) -> Option<String> {
        if env::attached_deposit() != NearToken::from_near(1) {
            panic!("Creating proposal requires depositing 1 NEAR.")
        }

        let (new_running_id, proposal_id) = Contract::generate_id(self.running_id);
        self.running_id = new_running_id;

        let proposal = ProposalInfo {
            project_info: ProjectInfo {
                contract_ids,
                twitter_url,
                audit_report_url,
                telegram_username,
                description,
                website_url,
            },
            proposed_by: env::predecessor_account_id(),
            kind: EProposalKind::NEW,
            project_id: None,
            votes: HashSet::new(),
        };

        if self.proposals.contains_key(&proposal_id) {
            panic!("id collision, please try again later");
        } else {
            self.proposals.insert(proposal_id.clone(), proposal);
            Option::from(proposal_id)
        }
    }

    #[payable]
    pub fn update_project(
        &mut self,
        project_id: String,
        contract_ids: HashSet<AccountId>,
        twitter_url: Option<String>,
        audit_report_url: Option<String>,
        telegram_username: Option<String>,
        description: Option<String>,
        website_url: Option<String>,
    ) -> Option<String> {
        if env::attached_deposit() != NearToken::from_near(1) {
            panic!("Creating proposal requires depositing 1 NEAR.")
        }

        if self.approved_projects.contains_key(&project_id) {
            let (new_running_id, proposal_id) = Contract::generate_id(self.running_id);
            self.running_id = new_running_id;

            let proposal = ProposalInfo {
                project_info: ProjectInfo {
                    contract_ids,
                    twitter_url,
                    audit_report_url,
                    telegram_username,
                    description,
                    website_url,
                },
                proposed_by: env::predecessor_account_id(),
                project_id: Option::from(project_id),
                kind: EProposalKind::UPDATE,
                votes: HashSet::new(),
            };

            if self.proposals.contains_key(&proposal_id) {
                panic!("id collision, please try again later");
            } else {
                self.proposals.insert(proposal_id.clone(), proposal);
                Option::from(proposal_id)
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

                        let project_info = ProjectInfo {
                            contract_ids: proposal.project_info.contract_ids.clone(),
                            twitter_url: proposal.project_info.twitter_url.clone(),
                            audit_report_url: proposal.project_info.audit_report_url.clone(),
                            telegram_username: proposal.project_info.telegram_username.clone(),
                            description: proposal.project_info.description.clone(),
                            website_url: proposal.project_info.website_url.clone(),
                        };

                        match proposal.kind {
                            EProposalKind::NEW => {
                                for contract_id in proposal.project_info.contract_ids.iter() {
                                    let contract_id_count_option =
                                        self.approved_contracts.get(&contract_id.clone());
                                    match contract_id_count_option {
                                        None => {
                                            self.approved_contracts.insert(contract_id.clone(), 1);
                                        }
                                        Some(contract_id_count) => {
                                            self.approved_contracts
                                                .insert(contract_id.clone(), contract_id_count + 1);
                                        }
                                    }
                                }

                                let (new_running_id, project_id) =
                                    Contract::generate_id(self.running_id);
                                self.running_id = new_running_id;

                                self.approved_projects.insert(project_id, project_info);
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
                                                    let contract_id_count_option = self
                                                        .approved_contracts
                                                        .get(&contract_id.clone());
                                                    match contract_id_count_option {
                                                        None => {}
                                                        Some(contract_id_count) => {
                                                            if contract_id_count.clone() == 1 {
                                                                self.approved_contracts
                                                                    .remove(&contract_id.clone());
                                                            } else {
                                                                self.approved_contracts.insert(
                                                                    contract_id.clone(),
                                                                    contract_id_count - 1,
                                                                );
                                                            }
                                                        }
                                                    }
                                                }

                                                for contract_id in
                                                    proposal.project_info.contract_ids.iter()
                                                {
                                                    let contract_id_count_option = self
                                                        .approved_contracts
                                                        .get(&contract_id.clone());
                                                    match contract_id_count_option {
                                                        None => {
                                                            self.approved_contracts
                                                                .insert(contract_id.clone(), 1);
                                                        }
                                                        Some(contract_id_count) => {
                                                            self.approved_contracts.insert(
                                                                contract_id.clone(),
                                                                contract_id_count + 1,
                                                            );
                                                        }
                                                    }
                                                }

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
        self.approved_contracts.contains_key(&contract_id)
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

    pub fn list_contracts(&self, from_index: i32, limit: i32) -> Vec<(&AccountId, &u32)> {
        self.approved_contracts
            .iter()
            .rev()
            .skip(from_index as usize)
            .take(limit as usize)
            .collect()
    }

    pub fn get_project_by_id(&self, project_id: String) -> Option<&ProjectInfo> {
        self.approved_projects.get(&project_id)
    }
}
