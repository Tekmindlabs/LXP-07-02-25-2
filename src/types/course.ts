import { ActivityType } from './class-activity';

interface Activity {
    id: string;
    type: ActivityType;
    title: string;
    content: string;
    deadline?: Date;
}
  
interface Section {
    id: string;
    title: string;
    activities: Activity[];
}
  
interface Unit {
    id: string;
    chapterNumber: number;
    title: string;
    sections: Section[];
}