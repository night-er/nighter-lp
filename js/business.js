// 店舗様向け ご利用の相談フォーム
// EmailJSの設定はお問い合わせ（contact.js）と同じものを使い、相談内容はメール本文（message）にまとめて送る
const EMAILJS_PUBLIC_KEY = '8VW626Nak_dPBPXec'; // EmailJSの公開キー
const EMAILJS_SERVICE_ID = 'service_qtqoj9r'; // EmailサービスID
const EMAILJS_TEMPLATE_ID = 'template_m3jrm9c'; // メールテンプレートID

document.addEventListener('DOMContentLoaded', function() {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const form = document.getElementById('business-form');
    const submitBtn = document.getElementById('business-submit');
    const errorBox = document.getElementById('business-error');
    const messageBox = document.getElementById('business-message');
    const done = document.getElementById('business-done');

    const value = (id) => document.getElementById(id).value.trim();
    const checked = (name) => [...form.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        errorBox.textContent = '';
        messageBox.className = 'biz-message';
        messageBox.textContent = '';

        // 入力チェック（未入力の項目名をまとめて表示する）
        const missing = [];
        if (!value('shop_name')) missing.push('店舗名');
        if (checked('shop_type').length === 0) missing.push('業態');
        if (!value('shop_address')) missing.push('所在地');
        if (!value('user_name')) missing.push('ご担当者名');
        if (!value('user_phone')) missing.push('電話番号');
        if (!value('user_email')) missing.push('メールアドレス');
        if (missing.length > 0) {
            errorBox.textContent = `${missing.join('・')}を入力してください。`;
            return;
        }
        if (!document.getElementById('user_email').checkValidity()) {
            errorBox.textContent = 'メールアドレスの形式をご確認ください。';
            return;
        }
        if (!document.getElementById('agree').checked) {
            errorBox.textContent = 'プライバシーポリシーへの同意が必要です。';
            return;
        }

        submitBtn.disabled = true;
        submitBtn.classList.add('is-loading');

        // お問い合わせと同じテンプレート（氏名・電話番号・メールアドレス・お問い合わせ内容）で届くため、
        // テンプレートの項目と重ならない店舗の情報だけを本文にまとめる
        const jobTypes = checked('job_types');
        const details = [
            ['店舗名', value('shop_name')],
            ['業態', checked('shop_type')[0]],
            ['所在地', value('shop_address')],
            ['募集を検討している職種', jobTypes.length > 0 ? jobTypes.join('、') : '未選択']
        ];
        const templateParams = {
            user_name: value('user_name'),
            user_email: value('user_email'),
            user_phone: value('user_phone'),
            message: [
                '【店舗様 ご利用のご相談】',
                ...details.map(([label, text]) => `${label}：${text}`),
                '',
                '■ご相談内容',
                value('message') || 'なし'
            ].join('\n')
        };

        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function() {
                // フォームを送信完了の画面に入れ替える
                form.reset();
                form.hidden = true;
                done.hidden = false;
                done.scrollIntoView({ behavior: 'smooth', block: 'center' });
                done.focus({ preventScroll: true });
            })
            .catch(function(error) {
                console.error('EmailJS Error:', error);
                messageBox.textContent = '送信に失敗しました。しばらく経ってから再度お試しください。';
                messageBox.className = 'biz-message error';
            })
            .finally(function() {
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-loading');
            });
    });
});
