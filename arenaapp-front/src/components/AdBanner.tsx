export default function AdBanner() {
  return (
    <div className="w-full px-0 py-3">
      <div className="w-full">
        <img
          src="https://cmtfqzzhfzymzwyktjhm.supabase.co/storage/v1/object/public/banners/bannerTest.gif"
          alt="Publicidad"
          className="w-full h-[140px] object-cover rounded-xl"
          loading="lazy"
        />
      </div>
    </div>
  )
}
