import * as AWS from '@aws-sdk/client-personalize-runtime';
import { GetPersonalizedRankingCommandInput } from '@aws-sdk/client-personalize-runtime';

const campaignArn: string | undefined =
	'arn:aws:personalize:us-east-1:675396999362:campaign/eventful-hackumass-mvp-2';
const REGION = 'us-east-1';
const client = new AWS.PersonalizeRuntime({ region: REGION });

async function getPersonalizedRankings(params: { inputList: string[]; userId: string }) {
	try {
		const data = await client.getPersonalizedRanking({ campaignArn, ...params });

		// process data.
		const { recommendationId, personalizedRanking } = data;
		return { recommendationId, personalizedRanking };
	} catch (error) {
		console.log(error);
		console.log('AWS GPR Error');
		return undefined;
	}
}

export { getPersonalizedRankings };
