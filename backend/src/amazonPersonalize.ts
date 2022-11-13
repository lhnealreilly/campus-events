import * as AWS from '@aws-sdk/client-personalize-runtime';
import { GetPersonalizedRankingCommandInput } from '@aws-sdk/client-personalize-runtime';

const campaignArn: string | undefined = undefined;
const REGION = 'us-east-1';
const client = new AWS.PersonalizeRuntime({ region: REGION });

async function getPersonalizedRankings(params: { inputList: string[]; userId: string }) {
	try {
		const data = await client.getPersonalizedRanking({ campaignArn, ...params });
		
		// process data.
		const { recommendationId, personalizedRanking } = data;
		return { recommendationId, personalizedRanking };
	} catch (error) {
		console.log('AWS GPR Error');
	}
}

export { getPersonalizedRankings };
