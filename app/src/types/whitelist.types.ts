export interface IProjectInfo {
  audit_report_url?: string | null;
  description?: string | null;
  telegram_username?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  contract_ids: string[];
}

export enum EProjectKind {
    NEW = "NEW",
    UPDATE = "UPDATE"
}

export interface IProposal {
    kind: EProjectKind,
    project_id: string | null,
    project_info: IProjectInfo,
    proposed_by: string;
    votes: string[]
}