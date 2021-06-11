const submitBtn = document.getElementById('submit_button');
const errorMsgHolder = document.getElementById('error-msgs');
const thankYouPage = document.getElementById('thankyou-page');
let version, feedbackFor;


errorMsgHolder.style.display = 'none';
let answers = {
    feedback: [],
    additionalComments: '',
    feedbackFor: ''
};

//global error handling
window.onerror = (e) => {
    const msg = e.replace('Uncaught ', '');
    errorMsgHolder.textContent = msg;
    errorMsgHolder.style.display = 'block';
}

const generateFeedbackClob = () => {
    answers.feedback = [];
    for (let i = 1; i < 11; i++) {
        document.querySelectorAll('input[name=qn_'+i+']').forEach(radio => {
            radio.checked && answers.feedback.push(radio.id);
        })
    }
    // adding additional comments to the answers object
    answers.additionalComments = document.querySelector('textarea[name=additional_comments]').value;
}

const validateFields = () => {
    errorMsgHolder.style.display = 'none';
    generateFeedbackClob();
    if(answers.feedback.length < 10) {
        throw('All answers are mandatory')
    }
}

submitBtn.addEventListener('click', () => {
    validateFields();
    fetch('/submitFeedback', {
        method: 'post',
        body: JSON.stringify(answers),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(resp => {
        resp.json().then(r => {
            if (r.status == 'SUCCESS') {
                localStorage.setItem('feedback_version', version);
                localStorage.setItem('feedback_id', r.feedback_id);
                thankYouPage.style.display = 'block';
            }
        })
    });
});

fetch('/getconfig').then(res => {
    return res.json();
}).then(res => {
    let submittedVersion = localStorage.getItem('feedback_version');
    let courseNameHolder = document.getElementById('course_name');
    let courseNameTableHolder = document.getElementById('course_name_table');
    let courseDateHolder = document.getElementById('course_date');
    let courseTrainersHolder = document.getElementById('course_trainers');
    let thankYouMsgCourseName = document.getElementById('thank-you-course-name');
    version = res.version;
    if (submittedVersion === version) {
        thankYouPage.style.display = 'block';
    }
    answers.feedbackFor = res.feedback_for;
    courseNameHolder.textContent = res.name;
    courseNameTableHolder.textContent = res.name;
    thankYouMsgCourseName.textContent = res.name;
    courseDateHolder.textContent = res.date;
    courseTrainersHolder.textContent = res.trainers;
    document.title = res.name + ' | ' + document.title;
});