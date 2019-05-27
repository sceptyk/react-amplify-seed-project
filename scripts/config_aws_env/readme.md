Script used to configure aws stack after amplify changes that are not supported by amplify at the moment.

- Setting AppSync security mode to IAM
- enabling unauthenticated identities
- adding appsync api resource policies
- s3 bucket cors policy
- update functions policies to access db
