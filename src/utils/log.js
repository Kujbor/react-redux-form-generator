module.exports = (...args) => console.info.apply(console, [
	`%c[ ${ args.shift(0) } ]`,
	'background: blue; color: white;',
	...args
]);
