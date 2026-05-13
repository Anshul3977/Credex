import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ResultsPage from '@/components/ResultsPage';

type Props = {
  params: { id: string };
};

async function getAuditData(id: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/audit/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getAuditData(params.id);

  if (!data) {
    return { title: 'Audit Not Found — SpendLens' };
  }

  const result = data.result;
  const savings = result.totalMonthlySavings;
  const title = `I could save $${savings}/month on AI — SpendLens`;
  const description = (result.summary || '').slice(0, 120);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [`${process.env.NEXT_PUBLIC_BASE_URL}/api/og?savings=${savings}`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function AuditResultsRoute({ params }: Props) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const res = await fetch(`${baseUrl}/api/audit/${params.id}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    redirect('/');
  }

  const result = await res.json();

  return <ResultsPage audit={result} />;
}
