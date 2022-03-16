console.log('Client script')

function prepareSendMail (e) {
	e.preventDefault()
	const data = {
		name: formMail.name.value,
		email: formMail.email.value,
		text: formMail.message.value
	}

	const resultContainer = formMail.querySelector('.j-form-status')
	resultContainer.innerHTML = 'Sending...'

	sendJson('/', data, 'POST', data => {
		formMail.reset()
		resultContainer.classList.remove('badge-danger')
		if (data.status === 'Error') {
			resultContainer.classList.add('badge-danger')
		}
		resultContainer.innerHTML = data.msg
	})
}

function sendJson (url, data, method, cb) {
	// eslint-disable-next-line no-undef
	let xhr = new XMLHttpRequest()
	xhr.open(method, url)
	xhr.setRequestHeader('Content-Type', 'application/json')
	xhr.onload = function () {
		let result
		try {
			result = JSON.parse(xhr.responseText)
		} catch (err) {
			// eslint-disable-next-line standard/no-callback-literal
			cb({ msg: 'Извините в данных ошибка', status: 'Error' })
		}
		cb(result)
	}
	xhr.send(JSON.stringify(data))
}

const formMail = document.querySelector('.j-form-email')
formMail.addEventListener('submit', prepareSendMail)
