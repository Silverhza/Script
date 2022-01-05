/*
捷径策略切换脚本, 该脚本需与捷径配合使用.

脚本兼容: Surge4.7, QuanX1.0.22(545+), Loon2.1.10(290+)
捷径地址: https://www.icloud.com/shortcuts/0f5b9a825cad47488a78ff2876b822dd

脚本配置:
-----------Surge------------
[Script]
捷径策略切换 = type=http-request,pattern=^http:\/\/nobyda\.policy,requires-body=1,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Shortcuts/PolicySwitch.js

--------QuantumuitX---------
[rewrite_local]
^http:\/\/nobyda\.policy url script-analyze-echo-response https://raw.githubusercontent.com/NobyDa/Script/master/Shortcuts/PolicySwitch.js

------------Loon------------
[Script]
http-request ^http:\/\/nobyda\.policy script-path=https://raw.githubusercontent.com/NobyDa/Script/master/Shortcuts/PolicySwitch.js, requires-body=true, tag=捷径策略切换

----------------------------
*/

const $ = new nobyda();
const url = $request.url;
const body = JSON.parse($request.body || '{}');

(async function SwitchPoliy() {
	let res = {};
	if (/\/getGroup$/.test(url))
		res.group = await $.getGroup();
	if (/\/getPolicy$/.test(url))
		res.policy = await $.getPolicy(body.group);
	if (/\/setPolicy$/.test(url))
		res.success = await $.setPolicy(body.group, body.policy);
	$.done(res);
})()

function nobyda() {
	const isLoon = typeof($loon) !== "undefined" && $loon > 289;
	const isQuanX = typeof($configuration) !== 'undefined';
	const isSurge = typeof($httpAPI) !== 'undefined';
	const m = `不支持您的APP版本, 请等待APP更新 ⚠️`;
	this.getGroup = () => {
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "get_customized_policy"
				}).then(b => {
					if (b.ret) {
						resolve(Object.keys(b.ret).filter(s => b.ret[s].type == "static"));
					} else resolve();
				}, () => resolve());
			})
	}
	this.getPolicy = (groupName) => {
		
			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "get_customized_policy",
					content: groupName
				}).then(b => {
					if (b.ret && b.ret[groupName]) {
						resolve(b.ret[groupName].candidates);
					} else resolve();
				}, () => resolve());
			})
	}
	this.setPolicy = (group, policy) => {

			return new Promise((resolve) => {
				$configuration.sendMessage({
					action: "set_policy_state",
					content: {
						[group]: policy
					}
				}).then((b) => resolve(!b.error), () => resolve());
			})

	}
	this.done = (body) => {
		const e = {
			response: {
				body: JSON.stringify(body)
			}
		};
		$done(typeof($task) != "undefined" ? e.response : e);
	}
}
