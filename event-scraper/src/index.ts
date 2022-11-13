import express, { Express, Request, Response } from 'express';
import { Event, CampusPulseSource, Organization, DataSource, EventsSource, OrganizationSource } from './DataGrabber';
import logger from 'morgan';
import { parseAsync } from 'json2csv';

// Initialize express
const app: Express = express();
const port: number = Number(process.env.PORT) || 4069;

app.use(logger('dev'));

interface AbstractInstitution {
  name: string;
}

interface EventfulInstitution extends AbstractInstitution {
  getEvents(): Promise<Event[]>;
}

interface OrganizedInstitution extends AbstractInstitution {
  getOrganizations(): Promise<Organization[]>;
}

class Institution implements EventfulInstitution, OrganizedInstitution {
  NAME: string;
  dataSources: DataSource[] = [];

  constructor(name: string) {
    this.NAME = name;
  }

  get name() {
    return this.NAME;
  }

  addDataSource(source: DataSource) {
    this.dataSources.push(source);
  }

  async getEvents(): Promise<Event[]> {
    let events = (await Promise.all(this.dataSources.map(s => {
      if (!('getEvents' in s)) return [];
      return (s as EventsSource).getEvents();
    }))).flat();
    return events;
  }

  async getOrganizations(): Promise<Organization[]> {
    let orgs = (await Promise.all(this.dataSources.map(s => {
      if (!('getOrgs' in s)) return [];
      return (s as OrganizationSource).getOrgs();
    }))).flat();
    return orgs;
  }
}


app.get('/', async (req: Request, res: Response) => {
  let org: Institution = new Institution("UMass Amherst");
  org.addDataSource(new CampusPulseSource("umassamherst"));
  let events = await org.getEvents();
  let orgs = await org.getOrganizations();
  res.status(200).send({ 'events': events, 'orgs': orgs });
});

app.get('/learn_data', async (req: Request, res: Response) => {
  let org: Institution = new Institution("UMass Amherst");
  org.addDataSource(new CampusPulseSource("umassamherst"));
  let events = await org.getEvents();
  let orgs = await org.getOrganizations();
  let mapped = events.map((event: Event) => {
    let realData = {
      ITEM_ID: event.relatedIDs[0],
      CREATION_TIMESTAMP: event.startTime.getTime(),
      DESCRIPTION: event.description,
    }

    let eventOrg = orgs.filter((o) => o.name === event.organizationName)[0];
    if (eventOrg != undefined) {
      Object.assign(realData, {
        DESCRIPTION: `${event.description}\n${event.categoryNames.join(', ')}\n${eventOrg.summary}\n${eventOrg.categoryNames.join(', ')}`
      });
    } else {
      console.warn(`Couldn't find org (${event.organizationName}) for ${event.eventName}`);
    }
    return realData;
  });
  res.status(200).attachment('learning_data.csv').send(await parseAsync(mapped));
});

app.listen(port, () => {
  console.log(`Running on port ${port}.`);
});
