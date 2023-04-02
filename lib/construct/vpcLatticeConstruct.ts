import { LambdaConstruct } from './lambdaConstruct';
import { Construct } from 'constructs';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import { aws_vpclattice as vpclattice } from 'aws-cdk-lib';
import { aws_logs as logs } from 'aws-cdk-lib';
import { VpcConstruct } from './vpcConstruct';
import { Ec2Construct } from './ec2Construct';
import * as cdk from 'aws-cdk-lib'

export interface VpcLatticeConstructProps {
  vpcConstruct: VpcConstruct,
  ec2Construct: Ec2Construct
  lambdaConstruct: LambdaConstruct
}

export class VpcLatticeConstruct extends Construct {
  constructor(scope: Construct, id: string, props: VpcLatticeConstructProps) {
    super(scope, id);


    //----------------VPC Lattice Service(Client EC2)-------------
    const vpcLatticeServiceNetwork = new vpclattice.CfnServiceNetwork(this, 'VpcLatticeServiceNetwork', {
      authType: 'NONE', // NONE or IAM
      name: 'test-vpclattice-servicenetwork'
    })

    const vpcLatticeServiceNetworkSg = new ec2.SecurityGroup(this, 'VpcLatticeServiceNetworkSecurityGroup', {
      vpc: props.vpcConstruct.vpc,
      allowAllOutbound: true
    })

    vpcLatticeServiceNetworkSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));
    vpcLatticeServiceNetworkSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    new vpclattice.CfnServiceNetworkVpcAssociation(this, 'VpcLatticeServiceNetworkVpcAssociation', {
      vpcIdentifier: props.vpcConstruct.vpc.vpcId,
      serviceNetworkIdentifier: vpcLatticeServiceNetwork.attrId,
      securityGroupIds: [vpcLatticeServiceNetworkSg.securityGroupId]
    })


    //VPC Lattice Service(EC2)
    const vpcLatticeServiceEc2 = new vpclattice.CfnService(this, 'VpcLatticeServiceEc2', {
      name: 'test-vpclattice-service-ec2',
      authType: 'NONE'
    })

    new vpclattice.CfnServiceNetworkServiceAssociation(this, 'VpcLatticeServiceNetworkServiceAssociationEc2', {
      serviceNetworkIdentifier: vpcLatticeServiceNetwork.attrId,
      serviceIdentifier: vpcLatticeServiceEc2.attrId
    })

    const vpcLatticeTargetGroupEc2 = new vpclattice.CfnTargetGroup(this, 'VpcLatticeTargetGroupEc2', {
      type: 'INSTANCE',
      targets: [{
        id: props.ec2Construct.bastionInstance.instanceId,
        port: 443
      }],
      config: {
        port: 443,
        protocol: 'HTTPS',
        vpcIdentifier: props.vpcConstruct.vpc.vpcId,
      },
      name: 'vpclattice-tg-ec2'
    })

    new vpclattice.CfnListener(this, 'VpcLatticeListenerEc2', {
      port: 443,
      protocol: 'HTTPS',
      serviceIdentifier: vpcLatticeServiceEc2.attrId,
      defaultAction: {
        forward: {
          targetGroups: [{
            targetGroupIdentifier: vpcLatticeTargetGroupEc2.attrId,
            weight: 100,
          }],
        },
      },
      name: 'vpclattice-listener-ec2'
    })


    //----------------VPC Lattice Service(Lambda)-------------
    const vpcLatticeServiceLambda = new vpclattice.CfnService(this, 'VpcLatticeServiceLambda', {
      name: 'test-vpclattice-service-lambda',
      authType: 'NONE'
    })

    new vpclattice.CfnServiceNetworkServiceAssociation(this, 'VpcLatticeServiceNetworkServiceAssociationLambda', {
      serviceNetworkIdentifier: vpcLatticeServiceNetwork.attrId,
      serviceIdentifier: vpcLatticeServiceLambda.attrId
    })

    const vpcLatticeTargetGroupDefaultLambda = new vpclattice.CfnTargetGroup(this, 'VpcLatticeTargetGroupDefaultLambda', {
      type: 'LAMBDA',
      targets: [{
        id: props.lambdaConstruct.defaultFunction.functionArn,
        port: 443
      }],
      name: 'vpclattice-tg-default-lambda'
    })

    const vpcLatticeListenerLambda = new vpclattice.CfnListener(this, 'VpcLatticeListenerLambda', {
      port: 443,
      protocol: 'HTTPS',
      serviceIdentifier: vpcLatticeServiceLambda.attrId,
      defaultAction: {
        forward: {
          targetGroups: [{
            targetGroupIdentifier: vpcLatticeTargetGroupDefaultLambda.attrId,
            weight: 100,
          }],
        },
      },
      name: 'vpclattice-listener-lambda'
    })



    const vpcLatticeTargetGroupFirstLambda = new vpclattice.CfnTargetGroup(this, 'VpcLatticeTargetGroupFirstLambda', {
      type: 'LAMBDA',
      targets: [{
        id: props.lambdaConstruct.firstFunction.functionArn,
        port: 443
      }],
      name: 'vpclattice-tg-first-lambda'
    })

    new vpclattice.CfnRule(this, 'VpcLatticeRuleFirstLambda', {
      action: {
        forward: {
          targetGroups: [{
            targetGroupIdentifier: vpcLatticeTargetGroupFirstLambda.attrId,
            weight: 100,
          }],
        },
      },
      match: {
        httpMatch: {
          method: 'GET',
          pathMatch: {
            match: {
              exact: '/first'
            },
            caseSensitive: true,
          },
        },
      },
      priority: 10,
      listenerIdentifier: vpcLatticeListenerLambda.attrId,
      serviceIdentifier: vpcLatticeServiceLambda.attrId,
      name: 'vpclattice-rule-first-lambda'
    })


    const vpcLatticeTargetGroupSecondLambda = new vpclattice.CfnTargetGroup(this, 'VpcLatticeTargetGroupSecondLambda', {
      type: 'LAMBDA',
      targets: [{
        id: props.lambdaConstruct.secondFunction.functionArn,
        port: 443
      }],
      name: 'vpclattice-tg-second-lambda'
    })


    new vpclattice.CfnRule(this, 'VpcLatticeRuleSecondLambda', {
      action: {
        forward: {
          targetGroups: [{
            targetGroupIdentifier: vpcLatticeTargetGroupSecondLambda.attrId,
            weight: 100,
          }],
        },
      },
      match: {
        httpMatch: {
          method: 'GET',
          pathMatch: {
            match: {
              exact: '/second',
            },
            caseSensitive: true,
          },
        },
      },
      priority: 20,
      listenerIdentifier: vpcLatticeListenerLambda.attrId,
      serviceIdentifier: vpcLatticeServiceLambda.attrId,
      name: 'vpclattice-rule-second-lambda'
    })

    const logGroup = new logs.LogGroup(this, "VpcLatticeLogGroup", {
      logGroupName: "vpc-lattice-lambda",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      retention: logs.RetentionDays.THREE_DAYS
    })

    new vpclattice.CfnAccessLogSubscription(this, 'VpcLatticeServerLambdaAccessLogSubscription', {
      destinationArn: logGroup.logGroupArn,
      resourceIdentifier: vpcLatticeServiceLambda.attrId,
    });


    //----------------VPC Lattice Service(Server EC2)-------------
    const vpcLatticeServiceNetworkSecondSg = new ec2.SecurityGroup(this, 'VpcLatticeServiceNetworkSecondSecurityGroup', {
      vpc: props.vpcConstruct.secondVpc,
      allowAllOutbound: true
    })

    vpcLatticeServiceNetworkSecondSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    new vpclattice.CfnServiceNetworkVpcAssociation(this, 'VpcLatticeServiceNetworkSecondVpcAssociation', {
      vpcIdentifier: props.vpcConstruct.secondVpc.vpcId,
      serviceNetworkIdentifier: vpcLatticeServiceNetwork.attrId,
      securityGroupIds: [vpcLatticeServiceNetworkSecondSg.securityGroupId]
    })

    const vpcLatticeServiceServerEc2 = new vpclattice.CfnService(this, 'VpcLatticeServiceServerEc2', {
      name: 'test-vpclattice-service-server-ec2',
      authType: 'NONE'
    })

    new vpclattice.CfnServiceNetworkServiceAssociation(this, 'VpcLatticeServiceNetworkServiceAssociationServerEc2', {
      serviceNetworkIdentifier: vpcLatticeServiceNetwork.attrId,
      serviceIdentifier: vpcLatticeServiceServerEc2.attrId
    })

    const vpcLatticeTargetGroupServerEc2 = new vpclattice.CfnTargetGroup(this, 'VpcLatticeTargetGroupServerEc2', {
      type: 'INSTANCE',
      targets: [{
        id: props.ec2Construct.serverInstance.instanceId,
        port: 80
      }],
      config: {
        port: 80,
        protocol: 'HTTP',
        vpcIdentifier: props.vpcConstruct.secondVpc.vpcId,
        healthCheck: {
          enabled: true,
          healthCheckIntervalSeconds: 15,
          healthCheckTimeoutSeconds: 15,
          healthyThresholdCount: 3,
          matcher: {
            httpCode: '200',
          },
          path: '/',
          port: 80,
          protocol: 'HTTP',
          unhealthyThresholdCount: 3,
        },
      },
      name: 'vpclattice-tg-server-ec2'
    })

    new vpclattice.CfnListener(this, 'VpcLatticeListenerServerEc2', {
      port: 80,
      protocol: 'HTTP',
      serviceIdentifier: vpcLatticeServiceServerEc2.attrId,
      defaultAction: {
        forward: {
          targetGroups: [{
            targetGroupIdentifier: vpcLatticeTargetGroupServerEc2.attrId,
            weight: 100,
          }],
        },
      },
      name: 'vpclattice-listener-server-ec2'
    })

    const logBucket = new s3.Bucket(this, 'VpcLatticeAccessLogBucket', {
    })

    new vpclattice.CfnAccessLogSubscription(this, 'VpcLatticeServerEc2AccessLogSubscription', {
      destinationArn: logBucket.bucketArn,
      resourceIdentifier: vpcLatticeServiceServerEc2.attrId,
    });

  }
}