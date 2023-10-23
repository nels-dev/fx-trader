import * as cdk from "aws-cdk-lib";
import { Construct } from 'constructs';
import * as ecr from "aws-cdk-lib/aws-ecr"
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import {UpdatePolicy} from "aws-cdk-lib/aws-autoscaling";

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // Public repo allows more storage in the free tier
    const ecrPublicRepository = ecr.Repository.fromRepositoryName(this, "repository", "public.ecr.aws/h7u1f7w9/fx-assist-backend-repository")

    const cluster = new ecs.Cluster(this, 'FxAssistBackendCluster', {});
    cluster.addCapacity('DefaultAutoScalingGroup', {
      instanceType: new ec2.InstanceType('t2.micro'),
      desiredCapacity: 1,
      maxCapacity:1,
      minCapacity:0,
      allowAllOutbound: true,
      updatePolicy: UpdatePolicy.rollingUpdate({
        minInstancesInService: 0,
        maxBatchSize: 1,
        minSuccessPercentage: 0,
      })
    })

    const taskDefinition = new ecs.Ec2TaskDefinition(this, 'FxAssistBackendTask', {
    });
    const container = taskDefinition.addContainer('Application',{
      image: ecs.ContainerImage.fromRegistry(ecrPublicRepository.repositoryName||'None', {}),
      portMappings: [
        {containerPort: 8080, hostPort: 80}
      ],
      memoryLimitMiB: 512
    })

    new ecs.Ec2Service(this, 'Service', {cluster, taskDefinition})
  }
}