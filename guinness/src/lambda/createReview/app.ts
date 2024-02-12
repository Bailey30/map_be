import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb"
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
        if (event.httpMethod !== "POST") {
            throw new Error(`postMethod only accepts POST method, you tried: ${event.httpMethod} method`)
        }
        // All log statements are written to cloudwatch
        console.info("received:", event)

        // Get id and name from the body of the request
        const body = JSON.parse(event.body!)
        const id = String(body.id)
        const location = body.location
        const price = parseFloat(body.price)
        const rating = parseInt(body.rating)
        const longitude = body.longitude
        const latitude = body.latitude

        //const o = {}

        //Object.keys(JSON.parse(body)).forEach((key)=> {
        //  o[key] = String(JSON.parse(body)[key])
        //})


        const params = {
            TableName: tableName,
            Item: { id: id, location: location, price: price, rating: rating, longitude: longitude, latitude: latitude }
        }
        console.log("PARAMS", params)


        const data = await ddbDocClient.send(new PutCommand(params))
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully added review',
                data: data
            }), headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        };
    } catch (err) {
        console.log("error creating review", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
