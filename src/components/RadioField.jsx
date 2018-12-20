import { Component } from 'react';
import propTypes from 'prop-types';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';
import inputClassNames from '../utils/inputClassNames';

export default class RadioField extends Component {

	static propTypes = {
		type: propTypes.string.isRequired,
		meta: propTypes.object.isRequired,
		input: propTypes.object.isRequired,
		label: propTypes.string,
		extra: propTypes.object,
		options: propTypes.array
	};

	static defaultProps = {
		label: '',
		extra: {},
		options: []
	};

	render() {

		const { type, meta, input, label, extra, options } = this.props;

		options.forEach(option => option.label = option.label || option.value);

		// log('RadioField -> render', { type, meta, input, label, options, extra });

		return (
			<div className='form-group row'>
				<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
				<div className='col-9'>
					{ options.map(option => (
						<div key={ option.value } className='form-check'>
							<label className='form-check-label'>
								<input
									className={ inputClassNames({ input, meta, type }) }
									type='radio'
									{ ...input }
									{ ...extra }
									value={ option.value }
									checked={ option.value === input.value }
								/>
								&nbsp;
								{ option.label }
							</label>
						</div>
					)) }
					<InvalidFeedback meta={ meta } />
				</div>
			</div>
		);
	}
}
