import { ButtonLink } from '../components/ui'

export default function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-20 text-center">
      <p className="m-0 text-sm font-extrabold tracking-widest text-ink-400 uppercase">Page not found</p>
      <h1 className="mt-2 text-4xl">This page slipped away</h1>
      <p className="mx-auto mt-3 max-w-md text-ink-600">
        The address you opened does not match any page in Action English. The lessons are all still
        here, ready to go.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/">Back to the home page</ButtonLink>
        <ButtonLink to="/lessons" variant="secondary">
          Browse lessons
        </ButtonLink>
      </div>
    </div>
  )
}
