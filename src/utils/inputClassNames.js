import classNames from 'classnames';

export default ({ input: { value }, meta, type }) => classNames({
	[type === 'radios' ? 'form-check-input' : 'form-control']: true,
	'is-invalid': meta && meta.touched && (meta.warning || meta.error),
	'is-valid': value && (!meta || (!meta.warning && !meta.error))
});
