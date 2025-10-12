
export interface ScheduleItem {
  id: string;
  name: string;
  start: number;
  end: number;
  color: string;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Preset {
  id: string;
  name: string;
  schedule: ScheduleItem[];
}
