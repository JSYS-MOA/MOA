import React from 'react'

const Modal = ( { item } : any)  => {
  return (



    <div>
      {item?.map((content :any, idx : number) => (
        <th>
          {content.storageName} 
        </th>
      ))}

       
    </div>
  )
}

export default Modal
