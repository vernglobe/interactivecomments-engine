# Welcome to interactive comments engine project

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template


 PASS  src/__tests__/index.spec.ts
  test comments procesor                                                                                                                                                                                        
    v get all comments by /{user_id} success (36 ms)                                                                                                                                                            
    v get all comments without /{user_id} fail (6 ms)                                                                                                                                                           
    v delete comment by /{user_id}/{comment_id} success (6 ms)                                                                                                                                                  
    v delete comment without /{comment_id} fail (5 ms)                                                                                                                                                          
    v delete comment without /{user_id}/{comment_id} fail (5 ms)                                                                                                                                                
    v update comment by /{user_id}/{comment_id} success (8 ms)                                                                                                                                                  
    v update comment without /{user_id}/{comment_id} fail (6 ms)                                                                                                                                                
    v update comment by /{user_id}/{comment_id} and without body content fail (6 ms)                                                                                                                            
    v add comment by /{user_id} success (6 ms)                                                                                                                                                                  
    v add comment without /{user_id} fail (6 ms)                                                                                                                                                                
    v get comment by /{user_id}/{comment_id} success (10 ms)                                                                                                                                                    
    v format comment as expected. (8 ms)                                                                                                                                                                        
                                                                                                                                                                                                                
----------|---------|----------|---------|---------|--------------------------------------------------------
File      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                                                                              ----------|---------|----------|---------|---------|--------------------------------------------------------
All files |   85.32 |    80.48 |     100 |   85.32 | 
 index.ts |   85.32 |    80.48 |     100 |   85.32 | 67,102-103,135-136,153-154,169-170,187-188,246-251,258
----------|---------|----------|---------|---------|--------------------------------------------------------
Test Suites: 1 passed, 1 total
Tests:       12 passed, 12 total
Snapshots:   0 total
Time:        1.318 s, estimated 2 s
Ran all test suites.
 