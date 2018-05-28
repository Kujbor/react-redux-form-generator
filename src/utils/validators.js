import moment from 'moment';

export const required = value => !value ? 'Поле является обязательным' : undefined;

export const numeric = value => value && isNaN(value) ? 'Должно быть числом' : undefined;

export const letters = value => value && !/^[а-яё]{1}([а-яё-]+?)?[а-яё]{1}$/i.test(value) ? 'Может содержать только буквы русского алфавита и дефис' : undefined;

export const numericAndLiteral = value => value && !/^[а-яА-ЯёЁa-zA-Z0-9\s]+$/i.test(value) ? 'Может содержать только буквы и цифры' : undefined;

export const account = value => value && /(^\d{20}$)/.test(value) ? 'Должен содержать 20 цифр' : undefined;

export const password = otherField => (value, allValues) => value && value !== allValues[otherField] ? 'Пароли не совпадают' : undefined;

export const uniqueArr = (groupName, fieldName) => (value, allValues) => {

	let valueMatches = false;
	let matches = 0;

	_.forEach(allValues[groupName], curVal => {
		if (curVal[fieldName] === value) matches++;
		if (matches > 1) {
			valueMatches = true;
			return false;
		}
	});

	if (valueMatches) return 'Такой счет уже есть';
};

export const isLength = (realLength, displayedLength) => value => value && value.length !== realLength ? `Должен содержать ${ displayedLength || realLength } цифр(-ы)` : undefined;

export const length = isLength;

export const digitalMask = length => value => value && value.replace(/[^0-9]/igm, '').length !== length ? `Должен содержать ${ length } цифр` : undefined;

export const phone = value => digitalMask(11)(value);
export const snils = value => digitalMask(11)(value);
export const depCode = value => digitalMask(6)(value);

export const innIP = value => value && value.length !== 12 ? 'ИНН должен содержать 12 цифр для получателя ИП' : undefined;

export const innUL = value => value && value.length !== 10 ? 'ИНН должен содержать 10 цифр для получателей юр.лиц и бюджетных организаций' : undefined;

export const oktmo = value => value && value.length !== 8 && value.length !== 11 ? 'код ОКТМО должен содержать 8 или 11 цифр' : undefined;

export const okato = value => value && value.length !== 8 && value.length !== 11 ? 'код ОКАТО должен содержать 8 или 11 цифр' : undefined;

export const okved = value => value && value.length !== 4 && value.length !== 5 && value.length !== 6 ? 'ОКВЭД должен содержать от 4 до 6 цифр' : undefined;

export const kpp = value => value && value.length !== 9 ? 'КПП должен содержать 9 цифр' : undefined;

export const max = max => value => value && +value.replace(/[^\d\.]/igm, '') > max ? `Значение не может быть больше ${ max }` : undefined;

export const uin = value => value && value !== '0' && (value.length !== 20 && value.length !== 25) ? 'УИН должен содержать 20 или 25 знаков' : undefined;

export const site = value => value && !/^([a-zа-яё0-9]([a-zа-яё0-9\-]{0,61}[a-zа-яё0-9])?\.)+[a-zа-яё]{2,6}$/i.test(value) ? 'Некорректный адрес в сети' : undefined;

export const email = value => value && !/^[a-zа-яё0-9._%+-]+@[a-zа-яё0-9.-]+\.[a-zа-яё]{2,}$/i.test(value) ? 'Некорректный email' : undefined;

export const time = value => value && !(/^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) ? 'Некорректное время' : undefined;

export const minDate = otherField => (value, allValues) => value && allValues[otherField] && moment(value).isAfter(allValues[otherField]) ? 'Введите корректный промежуток времени' : undefined;

export const maxDate = otherField => (value, allValues) => value && allValues[otherField] && moment(value).isBefore(allValues[otherField]) ? 'Введите корректный промежуток времени' : undefined;

export const date = value => value && !moment(value, 'YYYY-MM-DD', true).isValid() ? 'Введите корректную дату' : undefined;

export const dateLaterThan = checkDateString => value => {

	if (!value) return;

	if (checkDateString) {
		if (moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD') > moment(checkDateString, 'YYYY-MM-DD', true).format('YYYY-MM-DD')) return `Дата не может быть позднее ${ moment(checkDateString).format('DD.MM.YYYY') }`;
	} else {
		if (moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD') > moment().format('YYYY-MM-DD')) return 'Дата не может быть позднее текущей';
	}
};

export function dateLaterThanFieldDate(checkDateName) {

	return value => {

		const { data } = this.props;

		return dateLaterThan(data[checkDateName])(value);
	};
}

export const dateEarlierThan = checkDateString => value => {

	if (!value) return;

	if (checkDateString) {
		if (moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD') < moment(checkDateString, 'YYYY-MM-DD', true).format('YYYY-MM-DD')) return `Дата не может быть раньше ${ moment(checkDateString).format('DD.MM.YYYY') }`;
	} else {
		if (moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD')) return 'Дата не может быть ранее текущей';
	}
};

export function dateEarlierThanFieldDate(checkDateName) {

	return value => {

		const { data } = this.props;

		return dateEarlierThan(data[checkDateName])(value);
	};
}

export const datePayment = value => value && !moment(value, 'DD.MM.YYYY', true).isValid() ? 'Введите корректную дату' : undefined;

export const inn = value => {

	if (!value) return;
	if (+value === 0) return 'ИНН не может содержать только нули';

	if (value.length === 10 && +value[9] === Math.floor((2 * value[0] + 4 * value[1] + 10 * value[2] + 3 * value[3] + 5 * value[4] + 9 * value[5] + 4 * value[6] + 6 * value[7] + 8 * value[8]) % 11 % 10)) return;
	if (value.length === 12 && +value[10] === Math.floor((7 * value[0] + 2 * value[1] + 4 * value[2] + 10 * value[3] + 3 * value[4] + 5 * value[5] + 9 * value[6] + 4 * value[7] + 6 * value[8] + 8 * value[9]) % 11 % 10) && +value[11] === Math.floor((3 * value[0] + 7 * value[1] + 2 * value[2] + 4 * value[3] + 10 * value[4] + 3 * value[5] + 5 * value[6] + 9 * value[7] + 4 * value[8] + 6 * value[9] + 8 * value[10]) % 11 % 10)) return;

	return 'Введен некорректный ИНН';
};

export const ogrn = value => {

	if (!value) return;
	if (+value === 0) return 'ОГРН не может содержать только нули';

	if (value.length === 13 && +value[12] === Math.floor(value / 10 % 11 % 10)) return;
	if (value.length === 15 && +value[14] === Math.floor(value / 10 % 13 % 10)) return;

	return 'Введен некорректный ОГРН';
}

export const currencyNotNull = value => value && (Math.ceil(value) == 0) ? 'Введено неверное значение' : undefined;

export function shareSum(regexp, current) {

	return value => {

		const { data } = this.props;

		let sum = 0;

		for (const name in data) {

			if (name !== current && name.match(regexp)) {
				sum += +data[name].replace(/[^\d\.]/igm, '');
			}
		}

		if (sum + +value.replace(/[^\d\.]/igm, '') > 100) return 'Общая доля не может превышать 100%';
	};
}

export function unique(regexp, current) {

	return value => {

		const {	data } = this.props;

		for (const name in data) {
			if (name !== current && name.match(regexp) && data[name] === value) return 'Данное значение уже было использовано в аналогичном блоке';
		}
	};
}

const getDatesDifferenceInYears = (dateFrom, dateTo) => {

	const differenceInMilliseconds = new Date(dateTo) - new Date(dateFrom);

	return Math.abs(new Date(differenceInMilliseconds).getUTCFullYear() - 1970);
};

function validatePassportDate(birthdayDate, passportDate) {

	const today = moment().format('YYYY-MM-DD');
	const personAge = getDatesDifferenceInYears(birthdayDate, today);
	const passportAge = getDatesDifferenceInYears(birthdayDate, passportDate);

	const message = 'Паспорт недействителен по сроку действия';

	if (personAge >= 20 && personAge < 45) {
		return passportAge <= 19 ? message : undefined;
	} else if (personAge >= 45) {
		return passportAge <= 44 ? message : undefined;
	}
}

export function passportDate(birthdayDateName) {

	return value => {

		const { data } = this.props;

		return validatePassportDate(data[birthdayDateName], value);
	};
}

export function birthdayDate(passportDateName) {

	return value => {

		const { data } = this.props;

		return validatePassportDate(value, data[passportDateName]);
	};
}
