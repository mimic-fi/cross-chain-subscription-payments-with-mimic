// import { Client, EthersSigner } from "@mimicprotocol/sdk";

// const old_api_key =
//   "04d834fdf388dc76206c52ea2b3bacc8bcb6a5f47b5964b1a345f497d47ee3d1";
// const wallet = "0x96aAebbcBc6D91419Ea7EBf2977dc17e97D3c7C6";
// const new_smart_account = "0x793F9be9d8AEf8338A0af4008018645971D9FEd4";

// async function main(): Promise<void> {
//   console.log("1");
//   const client = new Client({
//     signer: EthersSigner.fromPrivateKey(
//       "0x04d834fdf388dc76206c52ea2b3bacc8bcb6a5f47b5964b1a345f497d47ee3d1",
//     ),
//   });
//   const configs = await client.configs.get({
//     signer: wallet,
//   });
//   console.log(`configs ${configs}`);

//   // const tasks = await client.tasks.get({cids: ['QmSWkfZiXY4697T1n82WMXVSPQBuFaJykYkdhFn2UBJpkH']})
//   // console.log(tasks)
// }

// main().catch((error) => {
//   console.error("Error:", error);
//   console.error("Status:", error?.status);
//   console.error("Body:", error?.body.content);
// });

import { ApiKeyAuth, Client } from '@mimicprotocol/sdk'
import { config } from 'dotenv'

config({ path: './scripts/.env' })

const apiKey = '04d834fdf388dc76206c52ea2b3bacc8bcb6a5f47b5964b1a345f497d47ee3d1'
const WALLET = '0x93eA260a11B45945a67E52Ea8B3CF4FBFbbd1393'

async function main(): Promise<void> {
  const client = new Client({
    auth: new ApiKeyAuth(apiKey),
  })

  const executions = await client.executions.get({
    sort: -1,
    limit: 50,
    offset: 0,
    configSig:
      '0x9daa7ca6d25411668f169969e00e061cf17bc381c10271b67b202e228a9a303b0377c823ec66e2fd7ddb68a2eef291cebe3931f476c414f6c25b39017a2e1daf1b',
  })
  console.log(executions)

  // const taskCids = Array.from(new Set(configs.map((c: any) => c.taskCid)));
  // const tasks = await Promise.all(taskCids.map((cid) => client.tasks.getByCid(cid)));

  // process.stdout.write(
  //   JSON.stringify(
  //     {
  //       wallet: WALLET,
  //       configsCount: configs.length,
  //       taskCids,
  //       tasksCount: tasks.length,
  //       tasks,
  //       configs,
  //     },
  //     null,
  //     2
  //   ) + "\n"
  // );
}

main().catch((error: any) => {
  console.error('Error (string):', String(error))
  console.error('Error (stack):', error?.stack)

  if (error?.status || error?.body) {
    console.error(
      JSON.stringify(
        {
          status: error?.status,
          body: error?.body,
          content: error?.body?.content,
          errors: error?.body?.content?.errors,
        },
        null,
        2
      )
    )
  }

  process.exit(1)
})
