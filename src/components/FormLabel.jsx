import { PureComponent } from 'react';
import propTypes from 'prop-types';
import classNames from 'classnames';

export default class FormLabel extends PureComponent {

	static propTypes = {
		meta: propTypes.object.isRequired,
		input: propTypes.object.isRequired,
		children: propTypes.node
	}

	render() {

		const { meta, input, children } = this.props;

		return (
			<label
				htmlFor={ input.name }
				className={ classNames({
					'col-3': true,
					'col-form-label': true,
					'text-danger': meta && meta.touched && (meta.warning || meta.error),
					'text-success': meta && meta.touched && !(meta.warning || meta.error)
				}) }
			>
				{ children }
			</label>
		);
	}
}
