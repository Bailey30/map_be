
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, ListObjectsCommand, GetObjectCommand } from "@aws-sdk/client-s3"

const bucketName = process.env.S3_BUCKET_NAME
const client = new S3Client({ region: "eu-west-2" })

// ALWAYS RETURN "statusCode" not "status"

export const getImages = async (event: any, context: any, callback: any) => {
    console.log('received:', event)
    try {
        // if (event.httpMethod !== "POST") {
        //     throw new Error(`postMethod only accepts POST  method, you tried: ${event.httpMethod} method`)
        // }

        const body = JSON.parse(event.body!)
        const location = body.location
        const s3Params = {
            Bucket: bucketName,
            Delimiter: "/",
            Prefix: "test"
        }

        const command = new ListObjectsCommand(s3Params)
        const response = await client.send(command)

        console.log({response})

        const responses: any = []
        
        if (response.Contents) {
            response.Contents.forEach(async ({ key }: any) => {
                const input = {
                    Bucket: bucketName,
                    Key: key,
                    ContentType: "image/jpeg"
                }
                const command2 = new GetObjectCommand(input)
                const response2 = await client.send(command2)
                console.log({response2})
                responses.push(response2)
            })
        }


        callback(null, {
            statusCode: 200,
            body: JSON.stringify({
                images: responses,
                location: location,
                message: "Successfully returned images for this location"
            })
            ,
            headers: {
                "Access-Control-Allow-Origin": "*"
            }
        })

    } catch (err: any) {
        console.log("error occured getting images for this location", err)
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                message: "error occured getting images for this location",
                error: err,
            })
        })
    }

}
