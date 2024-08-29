use near_workspaces::types::NearToken;
use serde_json::json;
use near_whitelist::ProjectInfo;

#[tokio::test]
async fn test_contract_is_operational() -> Result<(), Box<dyn std::error::Error>> {
    let sandbox = near_workspaces::sandbox().await?;
    let contract_wasm = near_workspaces::compile_project("./").await?;

    let contract = sandbox.dev_deploy(&contract_wasm).await?;

    let guardian_1 = sandbox.dev_create_account().await?;
    let guardian_2 = sandbox.dev_create_account().await?;
    let guardian_3 = sandbox.dev_create_account().await?;
    let rando_account = sandbox.dev_create_account().await?;

    // check if one contract is whitelisted without doing anything, this should false
    let initial_contract_outcome = contract
        .view("check_contract_whitelisted")
        .args_json(json!({"contract_id": "aa-harvest-moon.near"}))
        .await?;
    assert_eq!(initial_contract_outcome.json::<bool>()?, false);

    // now, try to add a project WITHOUT deposit, we can expect error here
    let add_project_without_deposit_outcome = rando_account
        .call(contract.id(), "add_project")
        .args_json(json!({
            "contract_ids": ["aa-harvest-moon.near"],
            "metadata": "{}",
            "project_id": "meteorHarvestMoon"
        }))
        .transact()
        .await?;
    assert!(add_project_without_deposit_outcome.is_failure());

    // try again with depositing not equal to 1 NEAR, expect error
    let add_project_with_5_deposit_outcome = rando_account
        .call(contract.id(), "add_project")
        .args_json(json!({
            "contract_ids": ["aa-harvest-moon.near"],
            "metadata": "{}",
            "project_id": "meteorHarvestMoon"
        }))
        .deposit(NearToken::from_near(5))
        .transact()
        .await?;
    assert!(add_project_with_5_deposit_outcome.is_failure());

    let add_project_outcome = rando_account
        .call(contract.id(), "add_project")
        .args_json(json!({
            "contract_ids": ["aa-harvest-moon.near"],
            "metadata": "{}",
            "project_id": "meteorHarvestMoon"
        }))
        .deposit(NearToken::from_near(1))
        .transact()
        .await?;
    assert!(add_project_outcome.is_success());

    // make sure rando_account balance is deducted
    let rando_account_details_after_proposing = rando_account.view_account().await?;
    assert!(rando_account_details_after_proposing.balance < NearToken::from_near(99));

    // make sure our contract receive the deposit
    let contract_account_details_after_proposing = contract.view_account().await?;
    assert!(contract_account_details_after_proposing.balance > NearToken::from_near(100));

    let proposal_id = add_project_outcome.json::<String>()?.clone();

    // make sure the proposal is not whitelisting the contract.
    let initial_contract_outcome = contract
        .view("check_contract_whitelisted")
        .args_json(json!({"contract_id": "aa-harvest-moon.near"}))
        .await?;
    assert_eq!(initial_contract_outcome.json::<bool>()?, false);

    // vote before added as guardian
    // status should remain pending, as vote is not effective
    let _ = guardian_1
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_2
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_3
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;

    let initial_contract_outcome = contract
        .view("check_contract_whitelisted")
        .args_json(json!({"contract_id": "aa-harvest-moon.near"}))
        .await?;
    assert_eq!(initial_contract_outcome.json::<bool>()?, false);

    // add guardian and vote again
    let _ = contract
        .call("add_guardian")
        .args_json(json!({
            "account_id": guardian_1.id().to_string(),
        }))
        .transact()
        .await?;
    let _ = contract
        .call("add_guardian")
        .args_json(json!({
            "account_id": guardian_2.id().to_string(),
        }))
        .transact()
        .await?;
    let _ = contract
        .call("add_guardian")
        .args_json(json!({
            "account_id": guardian_3.id().to_string(),
        }))
        .transact()
        .await?;

    let _ = guardian_1
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_2
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_3
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": proposal_id
        }))
        .transact()
        .await?;

    let initial_contract_outcome = contract
        .view("check_contract_whitelisted")
        .args_json(json!({"contract_id": "aa-harvest-moon.near"}))
        .await?;
    assert_eq!(initial_contract_outcome.json::<bool>()?, true);

    // make sure 1 NEAR is refunded to the user who create the proposal
    let rando_account_details_after_approving = rando_account.view_account().await?;
    assert!(rando_account_details_after_approving.balance > NearToken::from_near(99));

    let all_projects_outcome = contract
        .view("list_projects")
        .args_json(json!({"from_index": 0, "limit": 20}))
        .await?;

    let all_projects = all_projects_outcome.json::<Vec<(String, ProjectInfo)>>()?;

    // update the project to remove aa-harvest-moon.near
    // and check the contract status again after proposal is approved
    let update_project_outcome = rando_account
        .call(contract.id(), "update_project")
        .args_json(json!({
            "contract_ids": ["nothere.near"],
            "project_id": all_projects[0].0,
            "metadata": "{}"
        }))
        .deposit(NearToken::from_near(1))
        .transact()
        .await?;
    assert!(update_project_outcome.is_success());

    let update_proposal_id = update_project_outcome.json::<String>()?.clone();

    let _ = guardian_1
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": update_proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_2
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": update_proposal_id
        }))
        .transact()
        .await?;
    let _ = guardian_3
        .call(contract.id(), "vote_proposal")
        .args_json(json!({
            "proposal_id": update_proposal_id
        }))
        .transact()
        .await?;


    let initial_contract_outcome = contract
        .view("check_contract_whitelisted")
        .args_json(json!({"contract_id": "aa-harvest-moon.near"}))
        .await?;
    assert_eq!(initial_contract_outcome.json::<bool>()?, false);

    Ok(())
}
