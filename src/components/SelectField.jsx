import propTypes from 'prop-types';

import FormLabel from './FormLabel';
import InvalidFeedback from './InvalidFeedback';
import inputClassNames from '../utils/inputClassNames';

const SelectField = ({ meta, input, label, multiple, options, extra }) => {

	options.forEach(option => option.label = option.label || option.value);

	// log('SelectField -> render', { meta, input, label, options, multiple, extra });

	return (
		<div className='form-group row'>
			<FormLabel meta={ meta } input={ input }>{ label }</FormLabel>
			<div className='col-9'>
				<select
					className={ inputClassNames({ input, meta }) }
					multiple={ multiple }
					{ ...input }
					{ ...extra }
					value={ multiple && !input.value ? [] : input.value }
				>
					{ !multiple ? <option /> : null }
					{ options.map(({ label: optionLabel, value: optionValue }) => (
						<option
							key={ Math.random() }
							value={ optionValue }
							title={ optionLabel }
						>
							{ optionLabel }
						</option>
					)) }
				</select>
				<InvalidFeedback meta={ meta } />
			</div>
		</div>
	);
};

SelectField.propTypes = {
	type: propTypes.string.isRequired,
	meta: propTypes.object.isRequired,
	input: propTypes.object.isRequired,
	label: propTypes.string,
	extra: propTypes.object,
	options: propTypes.array,
	multiple: propTypes.bool
};

SelectField.defaultProps = {
	label: '',
	extra: {},
	options: [],
	multiple: false
};

export default SelectField;
