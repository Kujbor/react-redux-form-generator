module.exports = (...args) => {

	const label = args.shift(0);

	// eslint-disable-next-line no-console
	console.log.apply(console, [
		`%c[ ${ label } ]`,
		`background: ${ label === 'error' ? 'red' : 'blue' }; color: white;`,
		...args
	]);
};
