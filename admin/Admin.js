import React, { useEffect, useState, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getDatabase, ref, get, child, startAt, set, remove } from 'firebase/database';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import './Admin.css';

// Initialize Firebase
const firebaseConfig = {
  //
};
  
  // Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export default function DataList() {
  const [dataList, setDataList] = useState([]);
  const [showOnlyRead, setShowOnlyRead] = useState(false);
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastItemId, setLastItemId] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [copied, setCopied] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dbRef = ref(getDatabase());
        get(child(dbRef, `forms/`)).then((snapshot) => {
          if (snapshot.exists()) {
            console.log(snapshot.val());
            const data = snapshot.val();
            const items = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
            setDataList(items);
            setLastItemId(items[items.length - 1]?.id || null);
          } else {
            console.log('No data available');
          }
        });
      } catch (error) {
        console.error('Error fetching data from Firebase:', error);
      }
    };
    fetchData();
  }, []);

  const openGmail = (recipient) => {
    const mailtoLink = `mailto:${recipient}?subject=&body=`;
    window.open(mailtoLink);
  };

  const handleCheckboxChange = (itemId) => {
    const updatedDataList = dataList.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, read: !item.read };
        // Update the read status in Firebase
        const db = getDatabase(app);
        set(ref(db, `forms/${itemId}/read`), updatedItem.read);
        return updatedItem;
      }
      return item;
    });
    setDataList(updatedDataList);
  };

  const handleDelete = (itemId) => {
    // Remove the question from Firebase
    const db = getDatabase(app);
    remove(ref(db, `forms/${itemId}`));

    // Remove the question from the list
    const updatedDataList = dataList.filter((item) => item.id !== itemId);
    setDataList(updatedDataList);
  };

  const handleSearch = (event) => {
    setSearchEmail(event.target.value);
  };

  const filteredDataList = dataList.filter(
    (item) =>
      item.email.toLowerCase().includes(searchEmail.toLowerCase()) &&
      (selectedDoctor === '' || item.doctor === selectedDoctor)
  );

  const loadMoreData = async () => {
    setLoading(true);
    try {
      const dbRef = ref(getDatabase());
      const queryRef = child(dbRef, 'forms/');
      const query = startAt(queryRef, lastItemId);

      const snapshot = await get(query);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const newItems = Object.entries(data).map(([key, value]) => ({ id: key, ...value }));
        setDataList((prevDataList) => [...prevDataList, ...newItems]);
        setLastItemId(newItems[newItems.length - 1]?.id || null);
      } else {
        console.log('No more data available');
      }
    } catch (error) {
      console.error('Error fetching more data from Firebase:', error);
    }

    setLoading(false);
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (container.scrollHeight - container.scrollTop === container.clientHeight) {
      loadMoreData();
    }
  };

  useEffect(() => {
    // Save the showOnlyRead state to local storage when it changes
    localStorage.setItem('showOnlyRead', JSON.stringify(showOnlyRead));
  }, [showOnlyRead]);

  const handleShowOnlyRead = () => {
    setShowOnlyRead(true);
    setShowOnlyUnread(false);
    setSelectedDoctor('');
  };

  const handleShowAllQuestions = () => {
    setShowOnlyRead(false);
    setShowOnlyUnread(false);
    setSelectedDoctor('');
  };

  const handleShowOnlyUnread = () => {
    setShowOnlyRead(false);
    setShowOnlyUnread(true);
    setSelectedDoctor('');
  };

  const doctorOptions = [...new Set(dataList.map((item) => item.doctor))];

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 3000);
  };

  return (
    <div className="header">
      <h1>Список вопросов</h1>
      <div>
        <label htmlFor="search">Поиск по Email:</label>
        <input
          type="text"
          id="search"
          value={searchEmail}
          onChange={handleSearch}
          style={{ textAlign: 'center' }}
          placeholder="Введите Email"
        />
      </div>
      <button onClick={handleShowAllQuestions}>Показать все вопросы</button>
      <button onClick={handleShowOnlyRead}>Показать только прочитанные</button>
      <button onClick={handleShowOnlyUnread}>Показать непрочитанные</button>
      <select value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
        <option value="">Все специалисты</option>
        {doctorOptions.map((doctor) => (
          <option key={doctor} value={doctor}>
            {doctor}
          </option>
        ))}
      </select>
      <div
        className="question-list-container"
        ref={containerRef}
        onScroll={handleScroll}
        style={{ maxHeight: '500px', overflowY: 'scroll' }}
      >
        <ul className="question-list">
          {filteredDataList.map((item) => {
            if ((showOnlyRead && !item.read) || (showOnlyUnread && item.read)) {
              return null;
            }
            return (
              <li key={item.id}>
                <p>
                  <strong className="question-item">Специалист:</strong> {item.doctor}
                  <button className='copyButton' onClick={() => handleCopy(item.doctor)} style={{ marginLeft: '5px' }}>
                    <ContentCopyIcon/>
                  </button>
                  {copied}
                </p>
                <p>
                  <strong className="question-item">Контактные данные:</strong> {item.phone}
                  <button className='copyButton' onClick={() => handleCopy(item.phone)} style={{ marginLeft: '5px' }}>
                    <ContentCopyIcon/>
                  </button>
                  {copied}
                </p>
                <p>
                  <strong className="question-item">Email:</strong> {item.email}
                  <button className='copyButton' onClick={() => handleCopy(item.email)} style={{ marginLeft: '5px' }}>
                    <ContentCopyIcon/>
                  </button>
                  {copied}
                </p>
                <p>
                  <strong className="question-item">Содержание:</strong> {item.text}
                  <button className='copyButton' onClick={() => handleCopy(item.text)} style={{ marginLeft: '5px' }}>
                    <ContentCopyIcon/>
                  </button>
                  {copied}
                </p>
                <input
                  style={{cursor: "pointer"}}
                  type="checkbox"
                  checked={item.read}
                  onChange={() => handleCheckboxChange(item.id)}
                />
                <label style={{marginRight: "15px"}}>Прочитано</label>
                <button onClick={() => openGmail(item.email)}>Ответить</button>
                <button onClick={() => handleDelete(item.id)}>Удалить</button>
                <hr />
              </li>
            );
          })}
        </ul>
        {loading && <p>Loading...</p>}
      </div>
    </div>
  );
}