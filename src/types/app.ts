export type ChartData = {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
};

export type PieChartComponentProps = {
  data: ChartData[];
};

export interface BigNumberType {
  type: string;
  hex: string;
}

export interface Candidate {
  id: BigNumberType;
  name: string;
  visi: string;
  misi: string;
  voteCount: BigNumberType;
  lastUpdated: BigNumberType;
}

export interface ElectionContextProps {
  candidates: Candidate[];
  updateCandidates: () => Promise<void>;
}

export type CandidateHistory = [
  BigNumberType, // id
  string,       // name
  string,       // visi
  string,       // misi
  BigNumberType  // lastUpdated
];

export type Voter = {
  id: BigNumberType;
  name: string;
  email: string;
  password?: string;
  hasVoted: boolean;
  lastUpdated: BigNumberType;
};

export interface VoteCount {
  id: BigNumberType;
  voteCount: BigNumberType;
}

export interface VoteHistoryItem {
  hex: string;
  type: string;
}

export interface VoteHistory {
  candidate: VoteHistoryItem;
  count: VoteHistoryItem;
  timestamp: VoteHistoryItem;
}

export type VoterHistory = [
  BigNumberType, // id
  string,        // name
  string,        // email
  boolean,       // hasVoted
  string,        // txHash
  BigNumberType  // lastUpdated
];
