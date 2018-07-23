import { omega } from 'omega';
import styles from './_index.scss';

export const Button = ({ value, onClick }) => {
  return <button
    className={styles.button}
    onClick={onClick}>
    {value}
  </button>;
};