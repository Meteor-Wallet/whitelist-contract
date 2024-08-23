# Near SmartContract Whitelist

A simple smart contract to maintain a list of whitelist smartcontract
that can be accessed by anyone.

# Usage
1. To add a new project.

    Project can be added by anyone as long as they deposit 1 NEAR.
    When this call is initiated, it will be converted into a proposal, each proposal requires 3 'guardians' approval
    to be a valid project. The deposited 1 NEAR will be refunded after the proposal is approved.
    ```
   // available args
   {
        contract_ids: string[],
        twitter_url?: string,
        audit_report_url?: string,
        telegram_username?: string,
        description?: string,
        website_url?: string,
   }
   near call "whitelisthonkai.testnet" add_project '{"contract_ids":["x.near"]}' --accountId "youraccount.testnet" --deposit 1
   ```
   
2. To update an existing project

    Similar to add project, user is required to deposit 1 NEAR.
    Note that the update will overwrite all the fields.
    ```
   // available args
   {
        project_id: string,
        contract_ids: string[],
        twitter_url?: string,
        audit_report_url?: string,
        telegram_username?: string,
        description?: string,
        website_url?: string,
   }
   
   near call "whitelisthonkai.testnet" update_project '{"contract_ids":["x.near"],"project_id":"17243915185"}' --accountId "youraccount.testnet" --deposit 1
   ```

3. To list different entities.

    For listing guardians, args are not required and will always return the full list
    of guardians.

    ```
    // available methods
    - list_contracts
    - list_proposals
    - list_projects
    - list_guardians
    
    // available args
    {
        limit: number,
        from_index: number,
    }
    
    near view "whitelisthonkai.testnet" list_contracts '{"limit":0,"from_index":0}'
    ```

4. To vote a proposal

    If you are one of the guardians, you can vote a proposal
    ```
   near call "whitelisthonkai.testnet" vote_proposal '{"proposal_id":"17243915836"}' --accountId "youracc.testnet"
   ```

