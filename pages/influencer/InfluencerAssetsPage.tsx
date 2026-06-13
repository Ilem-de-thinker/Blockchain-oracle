import React from 'react';

const assets = ['Brand kit', 'Launch posters', 'Event banners', 'Video snippets'];

const InfluencerAssetsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-primary">Assets</p>
        <h1 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-text">Marketing kit placeholder.</h1>
        <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-secondary">Asset-library routing is ready even though the asset API and downloads are not live yet.</p>
      </div>

      <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
        {assets.map((asset) => (
          <div key={asset} className="rounded-[24px] border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base sm:text-lg font-bold text-text">{asset}</h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-text-secondary">Reserved for downloadable promotional material and campaign media.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfluencerAssetsPage;
