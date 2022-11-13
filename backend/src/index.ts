import express, { Express, Request, Response } from 'express';
// import DatabaseConnection from './db.js';
import morgan from 'morgan';
import axios from 'axios';
import * as uuid from 'uuid';
import { v4 } from 'uuid';
import { Application } from 'express-serve-static-core';
import { getPersonalizedRankings } from './amazonPersonalize.js';
import dotenv from 'dotenv';
dotenv.config();

const app: Application = express();
const PORT = process.env['PORT'];

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "http://localhost:8080"); // update to match the domain you will make the request from
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
  });

// Setup database connection
// const databaseConnection = new DatabaseConnection();
const db = 'events';
const collection = 'test';

/** Interface representing an event */
interface Location {
	name?: string;
	latitude?: number;
	longitude?: number;
}

interface Event {
	relatedIDs: string[];
	eventName: string;
	categoryNames: string[];
	organizationName: string;
	location: Location;
	startTime: Date;
	endTime: Date;
	description: string;
	image?: URL;
}

export interface Organization {
	relatedIDs: string[];
	name: string;
	categoryNames: string[];
	summary: string;
}

app.use(morgan('combined'));
app.use(express.json());

/**
 * GET /recomended/:id
 * @summary Retrieve a list of recommended events.
 * @param {UUID} id.path - The UUID of the user
 * @return {Event} 200 - Success response - application/json
 * @return {object} 404 - Bad response (not found) - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 */
app.get('/recommended/:id', async (req: Request, res: Response) => {
	const user = req.params.id;

	const eventQueryData = await axios.get('http://localhost:4069');
	
	let upcomingEvents = eventQueryData.data.events.filter((e: Event) => new Date(e.startTime) > new Date()).map((e: Event) => e.relatedIDs[0]);


	//Get Rankings
	const rankings = await getPersonalizedRankings({
		inputList: upcomingEvents,
		userId: user,
	});

	console.log(rankings);

	//Check that the return information is correct
	if (!rankings?.personalizedRanking) {
		return res.status(404).send();
	}

	/* For Database */
	// let result = await databaseConnection.find(
	// 	db,
	// 	collection,
	// 	rankings?.personalizedRanking.map(i => i.itemId)
	// );
	// await result.toArray();
	// const output = rankings?.personalizedRanking.map(rankId => {
	// 	return (result as unknown as Array<any>).find(item => item._id === rankId.itemId);
	// });
	const { events } = eventQueryData.data;
	const output = rankings?.personalizedRanking.map(item => {
		return events.find((evt: Event) => {
			return evt.relatedIDs.includes(item.itemId!);
		});
	});

	//Find all informa
	//Match scores to data
	res.status(200).send(output);
});

app.get('/query/:term', async (req: Request, res: Response) => {
	const result = await axios.get('http://localhost:4069');
	const { events } = result.data;
	const output = events.filter((e : Event) => e.eventName.toLowerCase().includes(req.params.term.toLowerCase()) || e.description.toLowerCase().includes(req.params.term.toLowerCase()))
	res.status(200).send(output);
});


app.get('/recommended', async (req: Request, res: Response) => {
	const result = await axios.get('http://localhost:4069');
	const { events } = result.data;
	const output = events.slice(0, 15);
	res.status(200).send(output);
});

// app.post('/events', async (req: Request, res: Response) => {
// 	// Check request body shape
// 	if (typeof req.body !== 'object' || !isEvent(req.body)) {
// 		return res.status(400).send();
// 	}

// 	let event = req.body as Event;
// 	event._id = v4();

// 	let result = await databaseConnection.insert(db, collection, [req.body]);
// 	if (result.insertedCount > 0) {
// 		return res.status(201).send();
// 	} else {
// 		return res.status(500).send();
// 	}
// });

app.listen(PORT, () => {
	console.log(`event-CRUD service is listening on port ${PORT}`);
});

// On Exit
process.on('exit', () => {
	console.log('Node.js is stopping. Terminating resources.');
	// databaseConnection.close().then(r => {
	// 	console.log('Database client: closed.');
	// });
});
