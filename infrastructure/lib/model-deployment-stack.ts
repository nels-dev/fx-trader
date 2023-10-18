import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sagemaker from 'aws-cdk-lib/aws-sagemaker'


export class ModelDeploymentStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const sagemakerRoleArn = cdk.Fn.importValue("SagemakerRoleArn")
        
        const currencyJobConfig = {
            'JPY':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/JPY/lstm-model-tuning-v2-JPY-014-503b7b6a/output/model.tar.gz',
            'CHF':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/CHF/lstm-model-tuning-v2-CHF-040-391289fb/output/model.tar.gz',
            'NZD':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/NZD/lstm-model-tuning-v2-NZD-028-d5ba8782/output/model.tar.gz',
            'GBP':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/GBP/lstm-model-tuning-v2-GBP-024-6104dc99/output/model.tar.gz',
            'EUR':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/EUR/lstm-model-tuning-v2-EUR-030-f8465952/output/model.tar.gz',
            'AUD':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/AUD/lstm-model-tuning-v2-AUD-022-50ef0b90/output/model.tar.gz',
            'CAD':'s3://infrastructurestack-trainingoutput7f73feca-1woma9bt6n7bk/CAD/lstm-model-tuning-v2-CAD-015-2f89d4f2/output/model.tar.gz',
        }

        for(const [key, value] of Object.entries(currencyJobConfig)){
            const model = new sagemaker.CfnModel(this, `model-lstm-v2-${key}`, {
                modelName: `model-lstm-v2-${key}`,
                executionRoleArn: sagemakerRoleArn,
                primaryContainer:{
                    image: '763104351884.dkr.ecr.us-west-2.amazonaws.com/tensorflow-inference:2.12-cpu',
                    modelDataUrl: value
                },
            })
    
            const endpointConfig = new sagemaker.CfnEndpointConfig(this, `endpoint-config-${key}`, {
                endpointConfigName: `endpoint-config-${model.modelName}`,
                productionVariants: [{
                    modelName: model.modelName || '',
                    variantName: 'All',
                    initialVariantWeight: 1,
                    serverlessConfig: {
                        maxConcurrency: 1,
                        memorySizeInMb: 1024
                    }       
                }]
            });
    
            const endpoint = new sagemaker.CfnEndpoint(this, `endpoint-${key}`, {
                endpointConfigName: endpointConfig.endpointConfigName || '',
                endpointName: `endpoint-${model.modelName}`
            });

            endpointConfig.addDependency(model)
            endpoint.addDependency(endpointConfig)
        }
    }
}