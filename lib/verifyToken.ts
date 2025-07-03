import { GetServerSidePropsContext } from 'next';
import nookies from 'nookies';
import jwt from 'jsonwebtoken';

type TokenPayload = {
  username: string;
  role: string;
  officeId: number;
};

export function verifyToken(ctx: GetServerSidePropsContext): { props: TokenPayload } | { redirect: { destination: string; permanent: boolean } } {
  const cookies = nookies.get(ctx);
  const token = cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return { props: decoded };
  } catch {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }
}
