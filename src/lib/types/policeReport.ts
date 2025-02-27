import { InvolvedPerson } from "./InvolvedPerson";

export interface policeReport {
    _id?: string;
    location: string;
    description: string;
    time: Date;
    securityMeasures: string;
    observations: string;
    evidenceItems: string[];
    attachments: string;
    involvedPeople: InvolvedPerson[];
}