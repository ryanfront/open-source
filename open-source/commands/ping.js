/*---
cmd: ping
desc: replies with pong
---*/

export default async function (ctx) {
  await ctx.reply("pong");
}
