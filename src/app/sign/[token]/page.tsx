import SignClient from './sign-client';

export default function SignPage({ params }: { params: { token: string } }) {
  return <SignClient token={params.token} />;
}
