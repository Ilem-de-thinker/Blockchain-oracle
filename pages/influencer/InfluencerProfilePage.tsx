import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import WorkspaceProfilePage from '../../components/account/WorkspaceProfilePage';
import { influencerApi, ReferralCodeResponse } from '../../src/api/influencer';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { useToast } from '../../src/hooks/useToast';
import { format, parseISO } from 'date-fns';

const InfluencerProfilePage: React.FC<{ user: User | null }> = ({ user }) => {
  const [referralData, setReferralData] = useState<ReferralCodeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const toast = useToast();

  const fetchReferralCode = async () => {
    try {
      setLoading(true);
      const data = await influencerApi.getReferralCode();
      setReferralData(data);
    } catch (err) {
      console.error('Failed to fetch referral code:', err);
      setError('Failed to load referral code.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferralCode();
    }
  }, [user]);

  const handleRefreshCode = async () => {
    try {
      setRefreshing(true);
      await influencerApi.refreshReferralCode();
      toast.success('New referral code generated!');
      await fetchReferralCode(); // Re-fetch the updated code
    } catch (err) {
      console.error('Failed to refresh referral code:', err);
      toast.error('Failed to generate new referral code.');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <WorkspaceProfilePage
      user={user}
      roleLabel="Influencer"
      heading="Influencer Profile"
      description="Manage your partner identity, public referral profile, and audience-facing account details."
    >
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading referral data...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {referralData && referralData.active_code ? (
              <div className="space-y-3">
                <p className="text-2xl sm:text-3xl font-bold text-primary">{referralData.active_code.code}</p>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Created: {format(parseISO(referralData.active_code.created_at), 'PPP')}</span>
                  {referralData.active_code.expires_at && (
                    <span>| Expires: {format(parseISO(referralData.active_code.expires_at), 'PPP')}</span>
                  )}
                  {referralData.active_code.days_remaining !== undefined && (
                    <Badge variant={referralData.active_code.days_remaining <= 7 ? 'destructive' : 'default'}>
                      {referralData.active_code.days_remaining} days left
                    </Badge>
                  )}
                </div>
                <Button onClick={handleRefreshCode} disabled={refreshing || loading}  className='text-white'>
                  {refreshing ? 'Generating...' : 'Generate New Code'}
                </Button>

                {referralData.all_codes && referralData.all_codes.length > 1 && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-lg font-semibold mb-2">Past Codes:</p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {referralData.all_codes.map((code, index) => (
                        <li key={index}>
                          {code.code} (Created: {format(parseISO(code.created_at), 'PPP')}){' '}
                          {code.is_expired && <Badge variant="outline">Expired</Badge>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              !loading && !error && <p>No active referral code found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </WorkspaceProfilePage>
  );
};

export default InfluencerProfilePage;
