import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, } from "@aws-sdk/lib-dynamodb"
const client = new DynamoDBClient({})
const ddbDocClient = DynamoDBDocumentClient.from(client)
/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const tableName = process.env.REVIEW_TABLE_NAME

export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        if (event.httpMethod !== "GET") {
            throw new Error(`postMethod only accepts GET method, you tried: ${event.httpMethod} method`)
        }
        // All log statements are written to cloudwatch
        console.info("received:", event)

        const params = {
            TableName: tableName,
        }

        const data = await ddbDocClient.send(new ScanCommand(params))
        const items = data.Items

        const normal = items?.map((item) => {
            const obj: { [key: string]: any } = {}
            for (const [key, value] of Object.entries(item)) {
                const v = Object.values(value)
                const k = Object.keys(value)
                if (k[0] === "N") {
                    obj[key] = parseInt(v[0])
                } else {
                    obj[key] = v[0]
                }
            }
            return obj
        })
        console.log("test commit for github actions")
        console.info(`response from: ${event.path} statusCode: ${200} body: ${items}`);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Returning all reviews',
                items: normal
            }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: err,
            }),
        };
    }
}
