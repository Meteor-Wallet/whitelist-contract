export interface IProjectInfo {
  metadata: string;
  pending_proposals: string[];
  contract_ids: string[];
  project_id: string;
}

export enum EProjectKind {
  NEW = "NEW",
  UPDATE = "UPDATE",
}

export interface IProposal {
  kind: EProjectKind;
  project_id: string | null;
  project_info: IProjectInfo;
  proposed_by: string;
  votes: string[];
}
