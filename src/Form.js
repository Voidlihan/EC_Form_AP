import React, { useState } from 'react';
import './Form.css';
import {initializeApp} from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, set, push } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  //
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function Form() {
    const [doctor, setDoctor] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [text, setText] = useState('');
    const [consent, setConsent] = useState(false);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
  
      // Create a new document in the "forms" collection
      const formData = {
        doctor: doctor,
        phone: phone,
        email: email,
        text: text
      };
  
      try {
        const db = getDatabase(app)
        const formRef = push(ref(db, 'forms')); // Generate a unique id
        await set(formRef, formData);
        console.log('Data successfully sent to Firebase!');
        // Reset form field values
        setDoctor('');
        setPhone('');
        setEmail('');
        setText('');
      } catch (error) {
        console.error('Error sending data to Firebase:', error);
      }
      alert('Ваш вопрос успешно отправлен. Скоро с Вами свяжутся')
    };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1 style={{textAlign:'center', paddingBottom: '50px'}}><strong>Задайте вопрос специалисту</strong></h1>
        <label htmlFor="doctor">Выберите специалиста</label>
        <select name="doctor" id="doctor" value={doctor} onChange={(e) => setDoctor(e.target.value)} required>
          <option value="">...</option>
          <option value="Ботулинотерапевт">Ботулинотерапевт</option>
          <option value="Цефалголог">Цефалголог</option>
          <option value="УЗИ">УЗИ</option>
          <option value="Акушер-гинеколог">Акушер-гинеколог</option>
          <option value="Эндокринная гинекология">Эндокринная гинекология</option>
          <option value="Урология">Урология</option>
          <option value="Детская гинекология">Детская гинекология</option>
          <option value="Репродуктивная гинекология">Репродуктивная гинекология</option>
          <option value="Генетик">Генетик</option>
          <option value="Эндокринолог">Эндокринолог</option>
          <option value="Гематолог">Гематолог</option>
          <option value="Невролог">Невролог</option>
          <option value="Врач пренатальной диагностики">Врач пренатальной диагностики</option>
        </select>
        {/* <input
          type="text"
          id="doctor"
          name="doctor"
          placeholder="ФИО врача..."
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
        /> */}

        <label htmlFor="phone">Контактные данные</label>
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder="+55555555..."
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="Введите ваш email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label htmlFor="text">Ваш вопрос</label>
        <textarea
          id="text"
          name="text"
          placeholder="..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        ></textarea>

        <div style={{margin: "10px"}}>
            <input
                type="checkbox"
                id="consent"
                name="consent"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                required
            />
            <label htmlFor="consent">Даю согласие на обработку персональных данных</label>
        </div>

        <button type="submit" className="special" id="contactSendButton">
          Отправить
        </button>
      </form>
    </div>
  );
}