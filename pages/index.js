import axios from 'axios';
import { useState } from 'react';
import DOMPurify from 'dompurify';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [file, setFile] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onFileChange = (event) => {
    setFile(event.target.files[0]);
    setResponseText(''); 
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResponseText(response.data.response);
    } catch (error) {
      setResponseText('Failed to process the image.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Timbuktu Manuscript Summarizer</h1>
      <form onSubmit={onSubmit} className={styles.form}>
        <input type="file" onChange={onFileChange} className={styles.input} />
        <button type="submit" className={styles.button}>
          {isLoading ? 'Analyzing...' : 'Upload Image'}
        </button>
      </form>
      {responseText && <div className={styles.responseText} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(responseText) }}></div>}
      {isLoading && <div className={styles.loadingText}>Analyzing Image...</div>}
    </div>
  );
}
