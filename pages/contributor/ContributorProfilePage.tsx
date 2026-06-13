import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import WorkspaceProfilePage from '../../components/account/WorkspaceProfilePage';
import { contributorApi, ContributorReferralCode } from '../../src/api/contributor';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { format, parseISO } from 'date-fns';

const ContributorProfilePage: React.FC<{ user: User | null }> = ({ user }) => {
  const [referralCode, setReferralCode] = useState<ContributorReferralCode | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReferralCode = async () => {
      try {
        setLoading(true);
        const data = await contributorApi.getReferralCode();
        setReferralCode(data);
      } catch (err) {
        console.error('Failed to fetch referral code:', err);
        setError('Failed to load referral code.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReferralCode();
    }
  }, [user]);

  return (
    <WorkspaceProfilePage
      user={user}
      roleLabel="Contributor"
      heading="Contributor Profile"
      description="Manage your partner identity and account details."
    >
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading referral code...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {referralCode && (
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-bold text-primary">{referralCode.referral_code}</p>
                <p className="text-sm text-muted-foreground">
                  Created: {format(parseISO(referralCode.created_at), 'PPP')}
                </p>
                {referralCode.is_permanent ? (
                  <Badge variant="success">Permanent Code</Badge>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Expires: {referralCode.expires_at ? format(parseISO(referralCode.expires_at), 'PPP') : 'N/A'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspaceProfilePage>
  );
};

export default ContributorProfilePage;