import json

def handler(event, context):
    print('Second Lambda Invoked')
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Second Lambda!')
    }