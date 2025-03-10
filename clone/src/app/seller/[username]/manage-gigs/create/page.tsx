// where we create the gigs
import {CreateForm} from ""

interface CreateGigProps {
    params: {
        username: string;
    }
}

const CreateGig =({params}: CreateGigProps) => {
    return (
        <div className="flex justify-center">
            <CreateForm
                username={params.username}
            />
        </div>
    )
}

export default CreateGig;