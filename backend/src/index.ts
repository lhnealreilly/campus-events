import express, { Express, Request, Response } from 'express';
import DatabaseConnection from './db.js';
import morgan from 'morgan';
import * as uuid from 'uuid';
import { v4 } from 'uuid';
import { Application } from 'express-serve-static-core';
import { getPersonalizedRankings } from './amazonPersonalize.js';

const app: Application = express();
const PORT = process.env['PORT'];

// Setup database connection
const databaseConnection = new DatabaseConnection();
const db = 'events';
const collection = 'test';

/** Interface representing a bug event */
interface Event {
	//Required
	_id: any;
	name: string;
	timestamp: number;
	clubCategory: string[];
	clubDescription: string;
	eventTags: string[];
	eventDescription: string;

	//Optional
	image?: string;
	latitude?: number;
	longitude?: number;
	locationName?: string;
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
app.get('/recomended/:id', async (req: Request, res: Response) => {
	const user = req.params.id;
	//Get Rankings
	const rankings = await getPersonalizedRankings({
		inputList: [],
		userId: user,
	});
	//Check that the return information is correct
	if (!rankings?.personalizedRanking) {
		return res.status(404).send();
	}
	//Find all information that matches
	let result = await databaseConnection.find(
		db,
		collection,
		rankings?.personalizedRanking.map(i => i.itemId)
	);
	//Match scores to data
	await result.toArray();
	const output = rankings?.personalizedRanking.map(rankId => {
		return (result as unknown as Array<any>).find(item => item._id === rankId.itemId);
	});
	res.status(200).json(output).send();
});

/**
 * GET /events
 * @summary Retrieve a collection of events.
 * @return {array<Event>} 200 - Success response - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 */
app.get('/events', async (req: Request, res: Response) => {
	let result = await databaseConnection.find(db, collection);
	result.toArray();
	res.status(200).json(result).send();
});

/**
 * POST /events
 * @summary Create a new event.
 * @param {object} request.body.required - The description of the event
 * @return {Event} 201 - Success response - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
app.post('/events', async (req: Request, res: Response) => {
	// Check request body shape
	if (typeof req.body !== 'object' || !isEvent(req.body)) {
		return res.status(400).send();
	}

	let event = req.body as Event;
	event._id = v4();

	let result = await databaseConnection.insert(db, collection, [req.body]);
	if (result.insertedCount > 0) {
		return res.status(201).send();
	} else {
		return res.status(500).send();
	}
});

/**
 * GET /event/:id
 * @summary Retrieve a single event.
 * @param {UUID} id.path - The UUID of the event
 * @return {Event} 200 - Success response - application/json
 * @return {object} 404 - Bad response (not found) - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 */
app.get('/event/:id', async (req: Request, res: Response) => {
	const filter = { _id: req.params.id };
	if ((await databaseConnection.count(db, collection, filter)) === 0) {
		return res.status(404).send();
	}

	let result = await databaseConnection.find(db, collection, filter);
	res.status(200).json(result).send();
});

/**
 * PATCH /event/:id
 * @summary Modify a single event.
 * @param {UUID} id.path - The UUID of the event
 * @param {object} request.body.required - The fields of the event being modified
 * @return {Event} 200 - Success response - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 * @return {object} 404 - Bad response (not found) - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
app.patch('/event/:id', async (req: Request, res: Response) => {
	const filter = { _id: req.params.id };
	if ((await databaseConnection.count(db, collection, filter)) === 0) {
		return res.status(404).send();
	}

	if (typeof req.body !== 'object') {
		return res.status(400).send();
	}
	for (let key in req.body) {
		switch (key) {
			case 'name':
			case 'clubDescription':
			case 'eventDescription':
			case 'image':
			case 'locationName':
				if (typeof req.body[key] !== 'string') {
					return res.status(400).send();
				} else continue;
			case 'timestamp':
			case 'latitude':
			case 'longitude':
				if (typeof req.body[key] !== 'number') {
					return res.status(400).send();
				} else continue;
			case 'clubCategory':
			case 'eventTags':
				if (
					!Array.isArray(req.body[key]) ||
					!req.body.every((value: any) => typeof value === 'string')
				) {
					return res.status(400).send();
				} else continue;
			default:
				console.log(`Key ${key} is not modifiable. Trying to modify event ${req.params.id}.`);
				return res.status(400).send();
		}
	}

	const updates = {
		$set: {
			...req.body,
		},
	};
	let result = await databaseConnection.update(db, collection, filter, updates);
	if (result.modifiedCount > 0) {
		res.status(500).send();
	}
	res.status(200).send();
});

/**
 * DELETE /event/:id
 * @summary Delete a single event.
 * @param {UUID} - id.path - The UUID of the event
 * @return {object} 204 - Success response (empty body) - application/json
 * @return {object} 400 - Bad response (server error) - application/json
 * @return {object} 404 - Bad response (not found) - application/json
 * @return {object} 500 - Internal Server Error - application/json
 */
app.delete('/event/:id', async (req: Request, res: Response) => {
	const filter = { _id: req.params.id };
	if ((await databaseConnection.count(db, collection, filter)) === 0) {
		return res.status(404).send();
	}

	let result = await databaseConnection.delete(db, collection, filter);
	res.status(204).send();
});

app.listen(PORT, () => {
	console.log(`event-CRUD service is listening on port ${PORT}`);
});

// On Exit
process.on('exit', () => {
	console.log('Node.js is stopping. Terminating resources.');
	databaseConnection.close().then(r => {
		console.log('Database client: closed.');
	});
});

function isEvent(event: object): event is Event {
	let e = event as Event;
	return (
		e.name !== undefined &&
		e.eventTags !== undefined &&
		e.timestamp !== undefined &&
		e.clubCategory !== undefined &&
		e.clubDescription !== undefined &&
		e.eventDescription !== undefined
	);
}
