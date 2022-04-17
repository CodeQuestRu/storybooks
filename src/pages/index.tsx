import type { NextPage } from 'next';

import Button from '../components/uikit/Button';



const Home: NextPage = () => {
  return (
    <div>
      <Button type="primary">Кнопка Primary</Button>
      <Button type="primary" danger>Кнопка Danger</Button>
      <Button type="ghost">Кнопка Ghost</Button>
      <Button type="link">Кнопка Link</Button>
    </div>
  )
}

export default Home;
