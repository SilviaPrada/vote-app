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
  transactionHash: BigNumberType;
  blockNumber: BigNumberType;
}

export interface ElectionContextProps {
  candidates: Candidate[];
  updateCandidates: () => Promise<void>;
}

export type CandidateHistory = [
  BigNumberType,
  string,       
  string,       
  string,       
  BigNumberType, 
  BigNumberType,  
  BigNumberType, 
  BigNumberType 
];

export type Voter = {
  id: BigNumberType;
  name: string;
  email: string;
  password?: string;
  hasVoted: boolean;
  lastUpdated: BigNumberType;
  transactionHash: BigNumberType;
  blockNumber: BigNumberType;
};

export interface VoteCount {
  id: BigNumberType;
  voteCount: BigNumberType;
  transactionHash: BigNumberType;
  blockNumber: BigNumberType;
}

export interface VoteHistoryItem {
  hex: string;
  type: string;
}

export interface VoteHistory {
  candidate: VoteHistoryItem;
  count: VoteHistoryItem;
  timestamp: VoteHistoryItem;
  transactionHash: BigNumberType;
  blockNumber: BigNumberType;
}

export type VoterHistory = [
  BigNumberType, 
  string,        
  string,      
  boolean,    
  BigNumberType, 
  BigNumberType,  
  BigNumberType,
  BigNumberType
];
