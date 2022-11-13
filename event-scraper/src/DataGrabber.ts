import axios from 'axios';

interface Location {
    name?: string;
    latitude?: number;
    longitude?: number;
}

export interface Event {
    relatedIDs: string[];
    eventName: string;
    categoryNames: string[];
    organizationName: string;
    location: Location;
    startTime: Date;
    endTime: Date;
    description: string;
}

export interface Organization {
    relatedIDs: string[];
    name: string;
    categoryNames: string[];
    summary: string;
}

export interface DataSource {};

export interface OrganizationSource extends DataSource {
    getOrgs(): Promise<Organization[]>;
}

export interface EventsSource extends DataSource {
    getEvents(after?: Date): Promise<Event[]>;
}

export class CampusPulseSource implements EventsSource, OrganizationSource {
    institution: string;

    constructor(institution: string) {
        this.institution = institution;
    }

    get baseUrl() {
        return `https://${this.institution}.campuslabs.com`;
    }

    async getEvents(after: Date = new Date()): Promise<Event[]> {
        let _resp = await axios.get(`${this.baseUrl}/engage/api/discovery/event/search?endsAfter=${encodeURIComponent(after.toISOString())}&orderByField=endsOn&orderByDirection=ascending&status=Approved&take=300&query=`);
        let j = await _resp.data;

        let events: Event[] = j.value.map((element: any) => {
            return {
                relatedIDs: [`campuspulse-i${element.institutionId}-e${element.id}`],
                eventName: element.name,
                categoryNames: [element.theme, element.categoryNames, element.benefitNames].flat(),
                organizationName: element.organizationName,
                location: { name: element.location, latitude: element.latitude, longitude: element.longitude },
                startTime: new Date(element.startsOn),
                endTime: new Date(element.endsOn),
                // TODO clean this better -- still has NBSPs and such
                description: stripTags(element.description),
            } as Event;
        });

        return events;
    }

    async getOrgs(): Promise<Organization[]> {
        let _resp = await axios.get(`${this.baseUrl}/engage/api/discovery/search/organizations?orderBy%5B0%5D=UpperName%20asc&top=1000&filter=&query=&skip=0`);
        let j = await _resp.data;

        let orgs: Organization[] = j.value.map((element: any) => {
            return {
                relatedIDs: [`campuspulse-i${element.InstitutionId}-o${element.Id}`],
                name: element.Name,
                categoryNames: element.CategoryNames,
                summary: element.Summary,
            } as Organization;
        });

        return orgs;
    }
}

function stripTags(html: string) {
    return html.replace(/(<([^>]+)>)/gi, "");
}
