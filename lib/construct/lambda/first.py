import json

def handler(event, context):
    print('First Lambda Invoked')
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from First Lambda!')
    }